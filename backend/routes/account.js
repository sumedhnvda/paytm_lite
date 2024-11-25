const express = require("express");
const { userDB, Account } = require("../db.js");
const router = express.Router();
const authMiddleware = require("../middleware.js");

// Get balance
router.get("/balance", authMiddleware, async (req, res) => {
    try {
        const account = await Account.findOne({ userId: req.userId });

        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        res.json({ balance: account.balance });
    } catch (error) {
        console.error("Error fetching balance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Transfer funds
router.post("/transfer", authMiddleware, async (req, res) => {
    const { amount, to } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
    }

    try {
        const session = await Account.startSession();
        session.startTransaction();

        const senderAccount = await Account.findOne({ userID: req.userId }).session(session);
        if (!senderAccount) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Sender account not found" });
        }

        if (senderAccount.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const receiverAccount = await Account.findOne({ userID: to }).session(session);
        if (!receiverAccount) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Receiver account not found" });
        }

        senderAccount.balance -= amount;
        receiverAccount.balance += amount;

        await senderAccount.save({ session });
        await receiverAccount.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ message: "Transfer successful" });
    } catch (error) {
        console.error("Error during transfer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
