import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { 
  validateTransaction, 
  createAccount, 
  getAccount, 
  createTransactions 
} from "../controllers";
import { accounts, transactions, entries } from "../db";

vi.mock("crypto", () => ({
  randomUUID: vi.fn(() => "mocked-uuid-123")
}));

vi.mock("../db", () => ({
  accounts: [],
  transactions: [],
  entries: []
}));

describe("Controllers", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    accounts.length = 0;
    transactions.length = 0;
    entries.length = 0;

    mockRequest = { body: {}, params: {} };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  describe("validateTransaction", () => {
    it("validates balanced entries", () => {
      mockRequest.body = {
        entries: [
          { accountId: "acc1", direction: "debit", amount: 100 },
          { accountId: "acc2", direction: "credit", amount: 100 }
        ]
      };

      validateTransaction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("rejects missing entries", () => {
      mockRequest.body = {};

      validateTransaction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Invalid Entries" });
    });

    it("rejects unbalanced entries", () => {
      mockRequest.body = {
        entries: [
          { accountId: "acc1", direction: "debit", amount: 100 },
          { accountId: "acc2", direction: "credit", amount: 50 }
        ]
      };

      validateTransaction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Entries do not balance" });
    });
  });

  describe("createAccount", () => {
    it("creates account with provided data", () => {
      mockRequest.body = {
        id: "custom-id",
        name: "Test Account",
        direction: "debit",
        balance: 1000
      };

      createAccount(mockRequest as Request, mockResponse as Response);

      expect(accounts).toHaveLength(1);
      expect(accounts[0]).toEqual({
        id: "custom-id",
        name: "Test Account",
        direction: "debit",
        balance: 1000
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it("generates UUID when id not provided", () => {
      mockRequest.body = {
        name: "Test Account",
        direction: "credit",
        balance: 500
      };

      createAccount(mockRequest as Request, mockResponse as Response);

      expect(accounts[0].id).toBe("mocked-uuid-123");
    });

    it("rejects invalid direction", () => {
      mockRequest.body = {
        name: "Test Account",
        direction: "invalid"
      };

      createAccount(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(accounts).toHaveLength(0);
    });
  });

  describe("getAccount", () => {
    beforeEach(() => {
      accounts.push(
        { id: "acc1", name: "Account 1", direction: "debit", balance: 100 },
        { id: "acc2", name: "Account 2", direction: "credit", balance: 200 }
      );
    });

    it("returns account when found", () => {
      mockRequest.params = { id: "acc1" };

      getAccount(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        id: "acc1",
        name: "Account 1",
        direction: "debit",
        balance: 100
      });
    });

    it("returns 404 when not found", () => {
      mockRequest.params = { id: "nonexistent" };

      getAccount(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Account not found" });
    });
  });

  describe("createTransactions", () => {
    beforeEach(() => {
      accounts.push(
        { id: "acc1", name: "Debit Account", direction: "debit", balance: 0 },
        { id: "acc2", name: "Credit Account", direction: "credit", balance: 0 }
      );
    });

    it("creates transaction with valid entries", () => {
      mockRequest.body = {
        id: "txn1",
        name: "Test Transaction",
        entries: [
          { accountId: "acc1", direction: "debit", amount: 100 },
          { accountId: "acc2", direction: "credit", amount: 100 }
        ]
      };

      createTransactions(mockRequest as Request, mockResponse as Response);

      expect(transactions).toHaveLength(1);
      expect(entries).toHaveLength(2);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it("updates account balances correctly", () => {
      mockRequest.body = {
        name: "Transaction",
        entries: [
          { accountId: "acc1", direction: "debit", amount: 100 },
          { accountId: "acc2", direction: "credit", amount: 100 }
        ]
      };

      createTransactions(mockRequest as Request, mockResponse as Response);

      expect(accounts[0].balance).toBe(100);
      expect(accounts[1].balance).toBe(100);
    });

    it("rejects when account not found", () => {
      mockRequest.body = {
        name: "Invalid Transaction",
        entries: [
          { accountId: "nonexistent", direction: "debit", amount: 100 },
          { accountId: "acc2", direction: "credit", amount: 100 }
        ]
      };

      createTransactions(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(transactions).toHaveLength(0);
    });
  });
});
