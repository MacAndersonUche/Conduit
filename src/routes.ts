import { Router } from "express";
import {
  createAccount,
  createTransactions,
  getAccount,
  validateTransaction,
} from "./controllers";

const router = Router();

router.post("/accounts", createAccount);
router.post("/transactions", validateTransaction, createTransactions);
router.get("/accounts/:id", getAccount);

export default router;
