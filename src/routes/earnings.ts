import express from 'express';
import { addEarning, listEarnings } from '../controller/earning';
const { verifyToken } = require('../middleware/auth');

const earningRoute = express.Router();

/**
 * @api {post} /api/earnings/add-new-earning Add New Earning
 * @apiName AddEarning
 * @apiGroup Earning
 *
 * @apiHeader {String} Authorization User's access token in Bearer format
 *
 * @apiBody {String} adId ID of the advertisement
 * @apiBody {Number} adDuration Duration of ad watched (optional, default 0)
 * @apiBody {Number} pointsEarned Points earned from this ad
 *
 * @apiSuccess {String} message Earning recorded successfully
 * @apiSuccess {Number} earningId ID of the newly created earning record
 * @apiSuccess {Number} walletId Wallet ID where points are added
 * @apiSuccess {Number} pointsAdded Number of points added to the wallet
 *
 * @apiError {String} error Error message
 * @apiErrorExample {json} MissingFields:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Ad ID and points are required"
 *     }
 * @apiErrorExample {json} WalletNotFound:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "Wallet not found"
 *     }
 */
earningRoute.post("/add-new-earning", verifyToken, addEarning);

/**
 * @api {get} /api/earnings/user-earning-list List User Earnings
 * @apiName ListEarnings
 * @apiGroup Earning
 *
 * @apiHeader {String} Authorization User's access token in Bearer format
 *
 * @apiSuccess {String} message Earnings list fetched successfully
 * @apiSuccess {Object[]} earnings Array of earning objects
 * @apiSuccess {Number} earnings.earningId Earning record ID
 * @apiSuccess {String} earnings.adId Advertisement ID
 * @apiSuccess {Number} earnings.adDuration Duration of ad watched
 * @apiSuccess {Number} earnings.pointsEarned Points earned
 * @apiSuccess {String} earnings.createdAt Timestamp when earning was recorded
 *
 * @apiError {String} error Error message
 */
earningRoute.get("/user-earning-list", verifyToken, listEarnings);

export default earningRoute