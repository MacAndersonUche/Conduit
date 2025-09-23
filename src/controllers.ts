import { Request, Response } from "express";
import { accounts, transactions, entries } from "./db";
import { Account } from "./models";
import { randomUUID } from "crypto";

export const createAccount = (req: Request, res: Response) => {
  const { id, name, direction, balance } = req.body;

  if (!direction || !["debit", "credit"].includes(direction)) {
    return res.status(400).json({ error: "direction must be 'debit' or 'credit'" });
  }

  const account: Account = {
    id: id || randomUUID(),
    name,
    direction,
    balance: balance || 0,
  };

  accounts.push(account);
  res.status(201).json(account);
};

export const getAccount = (req: Request, res: Response) => {
  const account = accounts.find((a) => a.id === req.params.id);
  if (!account) {
    return res.status(404).json({ error: "Account not found" });
  }
  res.json(account);
};


export const createTransactions = (req: Request, res: Response) => {
  res.json([{ id: 1, name: "Mac" }]);
};

