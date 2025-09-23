import { Router } from "express";
import { createAccount, createTransactions, getAccount } from "./controllers";


const router = Router();

router.post("/accounts", createAccount);
router.post("/transactions", createTransactions);
router.get("/accounts/:id", getAccount);

export default router;
