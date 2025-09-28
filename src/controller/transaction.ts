import { constants } from "../constants";
import { buildErrorResponse, buildObjectResponse } from "../utils/responseUtils";
import db from '../database/sqlConnect';

export const requestRedeemPoints = async (req: any, res: any) => {
  const connection = await db.getConnection();
  try {
    const userId = req.user.id;
    const { pointsRedeemed, amountRedeemed, phone, upiId } = req.body;

    if (!pointsRedeemed || !amountRedeemed || !phone || !upiId) {
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

    await connection.query(
      `UPDATE Wallet SET totalPoints = totalPoints - ? WHERE walletId = ?`,
      [pointsRedeemed, wallet.walletId]
    );

    const insertTransactionSql = `
      INSERT INTO Transaction (userId, walletId, pointsRedeemed, amountRedeemed, phone, upiId, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result]: any = await connection.query(insertTransactionSql, [
      userId,
      wallet.walletId,
      pointsRedeemed,
      amountRedeemed,
      phone,
      upiId,
      "PENDING",
    ]);

    return buildObjectResponse(res, {
      message: "Redeem request submitted. Awaiting admin approval.",
      transactionId: result.insertId,
    });
  } catch (error: any) {
    console.error("Error creating redeem request:", error);
    return buildErrorResponse(res, constants.errors.internalServerError, 500);
  } finally {
    connection.release();
  }
};

export const redeemPoints = async (req: any, res: any) => {
  const connection = await db.getConnection();
  try {
    const { transactionId, action } = req.body;

    if (!transactionId || !["APPROVE", "CANCEL"].includes(action)) {
      return buildErrorResponse(res, "Invalid request", 400);
    }

    const [txnRows] = await connection.query("SELECT * FROM Transaction WHERE transactionId = ?", [transactionId]);
    const txns = txnRows as any[];
    if (txns.length === 0) {
      return buildErrorResponse(res, "Transaction not found", 404);
    }

    const txn = txns[0];

    if (txn.status !== "PENDING") {
      return buildErrorResponse(res, "Transaction is already processed", 400);
    }

    const [walletRows] = await connection.query("SELECT * FROM Wallet WHERE walletId = ?", [txn.walletId]);
    const wallets = walletRows as any[];
    if (wallets.length === 0) {
      return buildErrorResponse(res, constants.errors.walletNotFound, 404);
    }

    const wallet = wallets[0];

    if (action === "CANCEL") {
       await connection.query(
        `UPDATE Wallet SET totalPoints = totalPoints + ? WHERE walletId = ?`,
        [txn.pointsRedeemed, wallet.walletId]
      );
      await connection.query("UPDATE Transaction SET status = ? WHERE transactionId = ?", ["CANCELLED", transactionId]);
      return buildObjectResponse(res, { message: "Transaction cancelled by admin" });
    }

    if (action === "APPROVE") {
      await connection.beginTransaction();

      await connection.query(
        `UPDATE Wallet SET totalAmountRedeemed = totalAmountRedeemed + ? WHERE walletId = ?`,
        [txn.amountRedeemed, wallet.walletId]
      );

      await connection.query("UPDATE Transaction SET status = ? WHERE transactionId = ?", ["COMPLETED", transactionId]);

      await connection.commit();

      return buildObjectResponse(res, { message: "Transaction approved and completed" });
    }
  } catch (error: any) {
    await connection.rollback();
    console.error("Error handling redeem request:", error);
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
    const transactions = rows as any[];

    return buildObjectResponse(res, {
      message: 'Transactions fetched successfully',
      transactions,
    });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return buildErrorResponse(res, constants.errors.internalServerError, 500);
  }
};

export const listPendingTransactions = async (req: Request, res: any) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM Transaction
       WHERE status = 'PENDING'
       ORDER BY createdAt DESC`
    );

    const transactions = rows as any[];

    return buildObjectResponse(res, {
      message: "Pending transactions fetched successfully",
      transactions,
    });
  } catch (error: any) {
    console.error("Error fetching pending transactions:", error);
    return buildErrorResponse(res, constants.errors.internalServerError, 500);
  }
};