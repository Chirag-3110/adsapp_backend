import { constants } from "../constants";
import { buildErrorResponse, buildObjectResponse } from "../utils/responseUtils";
import db from '../database/sqlConnect';

export const addEarning = async (req: any, res: any) => {
  try {
    const userId = req.user.id; 
    const { adId, adDuration=0, pointsEarned } = req.body;

    if (!adId || !pointsEarned) {
      return buildErrorResponse(res, constants.errors.missingFields, 400);
    }

    const [walletRows] = await db.query("SELECT * FROM Wallet WHERE userId = ?", [userId]);
    const wallets = walletRows as any[];

    if (wallets.length === 0) {
      return buildErrorResponse(res, constants.errors.walletNotFound, 404);
    }

    const walletId = wallets[0].walletId;

    const insertEarningSql = `
      INSERT INTO Earning (userId, walletId, adId, adDuration, pointsEarned)
      VALUES (?, ?, ?, ?, ?)
    `;
    const earningValues = [userId, walletId, adId, adDuration, pointsEarned];
    const [earningResult]: any = await db.query(insertEarningSql, earningValues);

    const updateWalletSql = `
      UPDATE Wallet
      SET totalPoints = totalPoints + ?
      WHERE walletId = ?
    `;
    await db.query(updateWalletSql, [pointsEarned, walletId]);

    return buildObjectResponse(res, {
      message: constants.success.earningRecordAdded,
      earningId: earningResult.insertId,
      walletId: walletId,
      pointsAdded: pointsEarned,
    });
  } catch (error: any) {
    return buildErrorResponse(res, constants.errors.internalServerError, 500);
  }
};

export const listEarnings = async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT earningId, adId, adDuration, pointsEarned, createdAt
      FROM Earning
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