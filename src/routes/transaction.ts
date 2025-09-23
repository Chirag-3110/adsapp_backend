import express from 'express';
import { listTransactions, redeemPoints } from '../controller/transaction';
const { verifyToken } = require('../middleware/auth');

const transactionRoute = express.Router();

/**
 * @api {post} /api/transactions/add-new-transactionn Redeem Points
 * @apiName RedeemPoints
 * @apiGroup Transaction
 *
 * @apiHeader {String} Authorization User's access token in Bearer format
 *
 * @apiBody {Number} pointsRedeemed Number of points user wants to redeem
 * @apiBody {Number} amountRedeemed Amount corresponding to the points
 *
 * @apiSuccess {String} message Points redeemed successfully
 * @apiSuccess {Number} transactionId ID of the created transaction
 *
 * @apiError {String} error Error message
 * @apiErrorExample {json} InsufficientPoints:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Insufficient funds"
 *     }
 * @apiErrorExample {json} WalletNotFound:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "Wallet not found"
 *     }
 */
transactionRoute.post("/add-new-transaction", verifyToken, redeemPoints);

/**
 * @api {get} /api/transactions/user-transactions List User Transactions
 * @apiName ListTransactions
 * @apiGroup Transaction
 *
 * @apiHeader {String} Authorization User's access token in Bearer format
 *
 * @apiSuccess {String} message Transaction list fetched successfully
 * @apiSuccess {Object[]} earnings Array of transaction objects
 * @apiSuccess {Number} earnings.transactionId Transaction ID
 * @apiSuccess {Number} earnings.pointsRedeemed Points redeemed in this transaction
 * @apiSuccess {Number} earnings.amountRedeemed Amount redeemed in this transaction
 * @apiSuccess {String} earnings.status Status of transaction (e.g., COMPLETED)
 * @apiSuccess {String} earnings.createdAt Transaction creation timestamp
 *
 * @apiError {String} error Error message
 */

transactionRoute.get("/user-transactions", verifyToken, listTransactions);

export default transactionRoute