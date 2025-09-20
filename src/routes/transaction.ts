import express from 'express';
import { listTransactions, redeemPoints } from '../controller/transaction';
const { verifyToken } = require('../middleware/auth');

const transactionRoute = express.Router();

transactionRoute.post("/add-new-transaction", verifyToken, redeemPoints);
transactionRoute.get("/user-transactions", verifyToken, listTransactions);

export default transactionRoute