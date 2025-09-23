import express from 'express';
import { createUser, deleteUser, getUserDetails, login, updateUser, userAnalytics } from '../controller/user';
import { uploadProfileImage } from '../middleware/uploadMiddleware';
const { verifyToken } = require('../middleware/auth');

const userRoute = express.Router();
/**
 * @api {post} /api/user/login User Login
 * @apiName Login
 * @apiGroup User
 *
 * @apiBody {String} email User's email
 * @apiBody {String} password User's password
 *
 * @apiSuccess {String} message Login successful
 * @apiSuccess {String} token JWT access token
 * @apiSuccess {Object} user User details
 * @apiSuccess {Number} user.id User ID
 * @apiSuccess {String} user.email
 * @apiSuccess {String} user.name
 * @apiSuccess {String} user.gender
 * @apiSuccess {String} user.profileImage
 * @apiSuccess {String} user.phone
 * @apiSuccess {String} user.accountDetailsId
 * @apiSuccess {String} user.dob
 * @apiSuccess {String} user.createdAt
 *
 * @apiError {String} error Error message
 */
userRoute.post("/login",login);
/**
 * @api {get} /api/user/get-user-details Get User Details
 * @apiName GetUserDetails
 * @apiGroup User
 *
 * @apiHeader {String} Authorization User's JWT access token
 *
 * @apiSuccess {Object} user User details
 * @apiSuccess {Number} user.id
 * @apiSuccess {String} user.email
 * @apiSuccess {String} user.name
 * @apiSuccess {String} user.gender
 * @apiSuccess {String} user.profileImage
 * @apiSuccess {String} user.phone
 * @apiSuccess {String} user.accountDetailsId
 * @apiSuccess {String} user.dob
 * @apiSuccess {String} user.createdAt
 *
 * @apiError {String} error Error message
 */
userRoute.get(`/get-user-details`, verifyToken, getUserDetails);
/**
 * @api {put} /api/user/update-profile Update User Profile
 * @apiName UpdateUser
 * @apiGroup User
 *
 * @apiHeader {String} Authorization User's JWT access token
 *
 * @apiBody {String} [name] User's name
 * @apiBody {String} [gender] User's gender
 * @apiBody {String} [phone] User's phone number
 * @apiBody {String} [dob] Date of birth
 * @apiBody {File} [profileImage] User's profile image (send in files, optional)
 *
 * @apiSuccess {String} message Profile updated successfully
 * @apiSuccess {Object} user Updated user details
 * @apiSuccess {String} user.name
 * @apiSuccess {String} user.gender
 * @apiSuccess {String} user.profileImage
 * @apiSuccess {String} user.phone
 * @apiSuccess {String} user.dob
 *
 * @apiError {String} error Error message
 */
userRoute.put("/update-profile", verifyToken, uploadProfileImage.single('profileImage'), updateUser);
/**
 * @api {delete} /api/user/delete-user Delete User Account
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiHeader {String} Authorization User's JWT access token
 *
 * @apiSuccess {String} message Account deleted successfully
 * @apiSuccess {Boolean} success true
 *
 * @apiError {String} error Error message
 */
userRoute.delete("/delete-user", verifyToken, deleteUser);
/**
 * @api {post} /api/user/signup-user Signup User
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiBody {String} name User's name
 * @apiBody {String} email User's email
 * @apiBody {String} password User's password
 * @apiBody {String} phone User's phone number
 * @apiBody {String} [dob] Date of birth
 * @apiBody {String} [gender] User's gender
 * @apiBody {File} profileImage User's profile image (mandatory, send in files)
 *
 * @apiSuccess {String} message Account created successfully
 * @apiSuccess {Object} user User details
 * @apiSuccess {Object} wallet Wallet details
 *
 * @apiError {String} error Error message
 */
userRoute.post("/signup-user", uploadProfileImage.single('profileImage'), createUser);
/**
 * @api {get} /api/user/get-user-analytics Get User Earning & Transaction Analytics
 * @apiName UserAnalytics
 * @apiGroup User
 *
 * @apiHeader {String} Authorization User's JWT access token
 *
 * @apiSuccess {String} message Analytics fetched successfully
 * @apiSuccess {Object} earnings Earning summary
 * @apiSuccess {Number} earnings.today Points earned today
 * @apiSuccess {Number} earnings.week Points earned this week
 * @apiSuccess {Number} earnings.month Points earned this month
 *
 * @apiSuccess {Object} transactions Transaction summary
 * @apiSuccess {Object} transactions.today Points and amount redeemed today
 * @apiSuccess {Object} transactions.week Points and amount redeemed this week
 * @apiSuccess {Object} transactions.month Points and amount redeemed this month
 *
 * @apiError {String} error Error message
 */
userRoute.get("/get-user-analytics", verifyToken, userAnalytics);

export default userRoute