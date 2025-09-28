import express from 'express';
import { listPendingTransactions, listTransactions, redeemPoints, requestRedeemPoints } from '../controller/transaction';
const { verifyToken } = require('../middleware/auth');

const transactionRoute = express.Router();

/**
 * @api {put} /api/transactions/handle-transaction-request Handle Transaction Request
 * @apiName HandleTransactionRequest
 * @apiGroup Transaction
 *
 * @apiHeader {String} Authorization Admin's access token in Bearer format
 *
 * @apiBody {Number} transactionId Transaction ID to handle
 * @apiBody {String="APPROVE","CANCEL"} action Action to perform (approve or cancel)
 *
 * @apiSuccess {String} message Transaction updated successfully
 * @apiSuccess {Object} transaction Updated transaction details
 *
 * @apiError {String} error Error message
 * @apiErrorExample {json} TransactionNotFound:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "Transaction not found"
 *     }
 * @apiErrorExample {json} InvalidAction:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid action. Use APPROVE or CANCEL."
 *     }
 * @apiErrorExample {json} InsufficientFunds:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Insufficient funds in wallet to approve transaction"
 *     }
 */
transactionRoute.put("/handle-transaction-request", verifyToken, redeemPoints);

/**
 * @api {post} /api/transactions/add-transaction-request Request Redeem Points
 * @apiName RequestRedeemPoints
 * @apiGroup Transaction
 *
 * @apiHeader {String} Authorization User's access token in Bearer format
 *
 * @apiBody {Number} pointsRedeemed Number of points user wants to redeem
 * @apiBody {Number} amountRedeemed Amount corresponding to the points
 * @apiBody {String} phone User's phone number
 * @apiBody {String} upiId UPI ID for redeem
 *
 * @apiSuccess {String} message Redeem request submitted successfully
 * @apiSuccess {Number} transactionId ID of the created transaction
 *
 * @apiError {String} error Error message
 * @apiErrorExample {json} WalletNotFound:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "Wallet not found"
 *     }
 * @apiErrorExample {json} InsufficientFunds:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Insufficient funds"
 *     }
 * @apiErrorExample {json} DataIsRequired:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "All fields are required"
 *     }
 * @apiErrorExample {json} InternalServerError:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Something went wrong, please try again later"
 *     }
 */
transactionRoute.post("/add-transaction-request", verifyToken, requestRedeemPoints);

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

/**
 * @api {get} /api/transactions/pending-transactions List Pending Transactions
 * @apiName ListPendingTransactions
 * @apiGroup Admin
 *
 * @apiHeader {String} Authorization Admin's access token in Bearer format
 *
 * @apiSuccess {String} message Success message
 * @apiSuccess {Object[]} transactions List of pending transactions
 * @apiSuccess {Number} transactions.id Transaction ID
 * @apiSuccess {Number} transactions.userId User ID who requested
 * @apiSuccess {Number} transactions.walletId Wallet ID
 * @apiSuccess {Number} transactions.pointsRedeemed Points requested to redeem
 * @apiSuccess {Number} transactions.amountRedeemed Amount requested
 * @apiSuccess {String} transactions.phone User phone
 * @apiSuccess {String} transactions.upiId User UPI ID
 * @apiSuccess {String} transactions.status Transaction status (PENDING)
 * @apiSuccess {Date} transactions.createdAt Creation date of the transaction
 *
 * @apiError {String} error Error message
 */
transactionRoute.get("/pending-transactions", verifyToken, listPendingTransactions);

export default transactionRoute