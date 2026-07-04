import express from "express";
import { traceMiddleware } from "./middleware/tracemiddleware.js";
import { sendLog } from "./utils/logger.js";

const app = express();
const port = 4000;

app.use(express.json());
app.use(traceMiddleware);

const paymentRecords = [];

app.post("/pay", async (req, res) => {

    const { orderId, amount } = req.body;

    if (!orderId || amount == null) {

        return res.status(400).json({
            error: "Order ID and amount are required"
        });

    }

    // Simulate payment failure (20%)
    const paymentSucceeded =
        Math.random() > 0.2;

    const paymentRecord = {

        paymentId:
            `PAY-${paymentRecords.length + 1}`,

        orderId,

        amount,

        status:
            paymentSucceeded
                ? "SUCCESS"
                : "FAILED"

    };

    paymentRecords.push(paymentRecord);

    console.log(
        `[${req.traceId}] Payment Processed`,
        paymentRecord
    );

    try {

        await sendLog({

            traceId: req.traceId,

            orderId,

            service: "payment-service",

            level:
                paymentSucceeded
                    ? "INFO"
                    : "ERROR",

            message:
                paymentSucceeded
                    ? "Payment Successful"
                    : "Payment Failed",

            timestamp:
                new Date().toISOString()

        });

    }
    catch (err) {

        console.error(
            "Logger unavailable:",
            err.message
        );

    }

    if (!paymentSucceeded) {

        return res.status(500).json(paymentRecord);

    }

    res.status(201).json(paymentRecord);

});

app.listen(port, () => {

    console.log(
        `Payment Service running on port ${port}`
    );

});