import express from 'express';
import { createUser, deleteUser, getUserDetails, login, updateUser, userAnalytics } from '../controller/user';
import { uploadProfileImage } from '../middleware/uploadMiddleware';
const { verifyToken } = require('../middleware/auth');

const userRoute = express.Router();

userRoute.post("/login",login);
userRoute.get(`/get-user-details`, verifyToken, getUserDetails);
userRoute.put("/update-profile", verifyToken, uploadProfileImage.single('profileImage'), updateUser);
userRoute.delete("/delete-user", verifyToken, deleteUser);
userRoute.post("/signup-user", uploadProfileImage.single('profileImage'), createUser);
userRoute.get("/get-user-analytics", verifyToken, userAnalytics);

export default userRoute