import express from 'express';
import { addEarning, listEarnings } from '../controller/earning';
const { verifyToken } = require('../middleware/auth');

const earningRoute = express.Router();

earningRoute.post("/add-new-earning", verifyToken, addEarning);
earningRoute.get("/user-earning-list", verifyToken, listEarnings);

export default earningRoute