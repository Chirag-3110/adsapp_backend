import { constants } from "../constants";
import { buildErrorResponse, buildObjectResponse } from "../utils/responseUtils";
import db from '../database/sqlConnect';

export const redeemPoints = async (req: any, res: any) => {
  const connection = await db.getConnection();
  try {
    const userId = req.user.id;
    const { pointsRedeemed, amountRedeemed } = req.body;

    if (!pointsRedeemed || !amountRedeemed) {
      return buildErrorResponse(res, constants.errors.dataIsReq, 400);
    }

    const [walletRows] = await connection.query("SELECT * FROM Wallet WHERE userId = ?", [userId]);
    const wallets = walletRows as any[];
    if (wallets.length === 0) {
      return buildErrorResponse(res, constants.errors.walletNotFound, 404);
    }

    const wallet = wallets[0];

    if (pointsRedeemed > wallet.totalPoints) {
      return buildErrorResponse(res, constants.errors.insufficiendFunds, 400);
    }

    await connection.beginTransaction();

    const updateWalletSql = `
      UPDATE Wallet
      SET totalPoints = totalPoints - ?, totalAmountRedeemed = totalAmountRedeemed + ?
      WHERE walletId = ?
    `;
    await connection.query(updateWalletSql, [pointsRedeemed, amountRedeemed, wallet.walletId]);

    const insertTransactionSql = `
      INSERT INTO Transaction (userId, walletId, pointsRedeemed, amountRedeemed, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result]: any = await connection.query(insertTransactionSql, [
      userId,
      wallet.walletId,
      pointsRedeemed,
      amountRedeemed,
      "COMPLETED",
    ]);

    await connection.commit();

    return buildObjectResponse(res, {
      message: constants.success.pointsRedemed,
      transactionId: result.insertId,
    });
  } catch (error: any) {
    await connection.rollback();
    console.error("Error redeeming points:", error);
    return buildErrorResponse(res, constants.errors.internalServerError, 500);
  } finally {
    connection.release();
  }
};

export const listTransactions = async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT transactionId, pointsRedeemed, amountRedeemed, status, createdAt
      FROM Transaction
      WHERE userId = ?
      ORDER BY createdAt DESC
    `;

    const [rows] = await db.query(sql, [userId]);
    const earnings = rows as any[];

    return buildObjectResponse(res, {
      message: constants.success.earningList,
      earnings,
    });
  } catch (error: any) {
    console.error("Error fetching earnings:", error);
    return buildErrorResponse(res, constants.errors.internalServerError, 500);
  }
};