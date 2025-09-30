import { describe, expect, it, vi } from "vitest";
import { validateTransaction } from "../src/controllers";

function createMockReq(body: any) {
  return { body } as any;
}

function createMockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function createNext() {
  return vi.fn();
}

describe("validateTransaction", () => {
  it("passes when exactly one debit and one credit with equal amounts", () => {
    const req = createMockReq({
      entries: [
        { accountId: "a1", direction: "debit", amount: 100 },
        { accountId: "a2", direction: "credit", amount: 100 },
      ],
    });
    const res = createMockRes();
    const next = createNext();

    validateTransaction(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("fails when two debits and no credits", () => {
    const req = createMockReq({
      entries: [
        { accountId: "a1", direction: "debit", amount: 50 },
        { accountId: "a2", direction: "debit", amount: 50 },
      ],
    });
    const res = createMockRes();
    const next = createNext();

    validateTransaction(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Transaction must contain exactly one debit and one credit",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("fails when two credits and no debits", () => {
    const req = createMockReq({
      entries: [
        { accountId: "a1", direction: "credit", amount: 50 },
        { accountId: "a2", direction: "credit", amount: 50 },
      ],
    });
    const res = createMockRes();
    const next = createNext();

    validateTransaction(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Transaction must contain exactly one debit and one credit",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("fails when amounts do not balance even with one debit and one credit", () => {
    const req = createMockReq({
      entries: [
        { accountId: "a1", direction: "debit", amount: 60 },
        { accountId: "a2", direction: "credit", amount: 50 },
      ],
    });
    const res = createMockRes();
    const next = createNext();

    validateTransaction(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Entries do not balance" });
    expect(next).not.toHaveBeenCalled();
  });

  it("fails on invalid entries shape", () => {
    const req = createMockReq({ entries: [{ accountId: "a1" }] });
    const res = createMockRes();
    const next = createNext();

    validateTransaction(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid Entries" });
    expect(next).not.toHaveBeenCalled();
  });
});


