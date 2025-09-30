import { NextFunction, Request, Response } from "express";
import { accounts, transactions, entries } from "./db";
import { Account, Entry, Transaction } from "./models";
import { randomUUID } from "crypto";

const isValidEntry = (entry: Entry) => {
  return "accountId" in entry && "direction" in entry && "amount" in entry;
};

export const validateTransaction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { entries }: Transaction = req.body;

  if (!entries || entries.length < 2 || !entries.every(isValidEntry)) {
    return res.status(400).json({ error: "Invalid Entries" });
  }

  const debitCount = entries.filter((e) => e.direction === "debit").length;
  const creditCount = entries.filter((e) => e.direction === "credit").length;

  // Enforce exactly one debit and one credit
  if (debitCount !== 1 || creditCount !== 1) {
    return res
      .status(400)
      .json({ error: "Transaction must contain exactly one debit and one credit" });
  }

  const totalDebits = entries
    .filter((e) => e.direction === "debit")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCredits = entries
    .filter((e) => e.direction === "credit")
    .reduce((sum, e) => sum + e.amount, 0);

  if (totalDebits !== totalCredits) {
    return res.status(400).json({ error: "Entries do not balance" });
  }

  next();
};

export const createAccount = (req: Request, res: Response) => {
  const { id, name, direction, balance } = req.body;

  if (!direction || !["debit", "credit"].includes(direction)) {
    return res
      .status(400)
      .json({ error: "direction must be 'debit' or 'credit'" });
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
  const { id, name, entries: reqEntries }: Transaction = req.body;

  const transaction: Transaction = {
    id: id || randomUUID(),
    name,
    entries: [],
  };

  for (const e of reqEntries) {
    const account = accounts.find((a) => a.id === e.accountId);
    if (!account) {
      return res
        .status(400)
        .json({ error: `Account not found: ${e.accountId}` });
    }

    const newEntry: Entry = {
      id: randomUUID(),
      transactionId: transaction.id,
      accountId: e.accountId,
      direction: e.direction,
      amount: e.amount,
    };

    if (account.direction === newEntry.direction) {
      account.balance += newEntry.amount;
    } else {
      account.balance -= newEntry.amount;
    }

    entries.push(newEntry);
    transaction.entries.push(newEntry);
  }

  transactions.push(transaction);

  res.status(201).json(transaction);
};
