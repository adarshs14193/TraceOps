import express from "express";
import axios from "axios";
import { traceMiddleware } from "./middleware/tracemiddleware.js";
import { sendLog } from "./utils/logger.js";

const app = express();
const port = 3000;

const PAYMENT_SERVICE_URL =
    process.env.PAYMENT_SERVICE_URL || "http://localhost:4000";

console.log("PAYMENT_SERVICE_URL =", PAYMENT_SERVICE_URL);

const products = [
    { item: "apple", price: 2 },
    { item: "banana", price: 1.5 },
    { item: "milk", price: 3 }
];

const orders = [];

app.use(express.json());
app.use(traceMiddleware);

app.post("/order", async (req, res) => {

    const { item, quantity } = req.body;

    const product = products.find(
        (entry) => entry.item === item
    );

    if (!product) {
        return res.status(404).json({
            error: "Product not found"
        });
    }

    if (quantity <= 0) {
        return res.status(400).json({
            error: "Quantity must be greater than zero"
        });
    }

    const order = {
        orderId: `ORD-${orders.length + 1}`,
        item,
        quantity,
        price: product.price * quantity,
        status: "PENDING"
    };

    console.log(`[${req.traceId}] Order created`, order);

    try {

        const paymentResponse = await axios.post(
            `${PAYMENT_SERVICE_URL}/pay`,
            {
                orderId: order.orderId,
                amount: order.price
            },
            {
                headers: {
                    "trace-id": req.traceId
                }
            }
        );

        if (paymentResponse.data.status === "SUCCESS") {
            order.status = "PAID";
        }

        console.log(
            `[${req.traceId}] Payment Successful`
        );

    }
    catch (err) {

        order.status = "PAYMENT_FAILED";

       console.error(err);

    }

    orders.push(order);

    try {

        await sendLog({

            traceId: req.traceId,

            orderId: order.orderId,

            service: "order-service",

            level:
                order.status === "PAID"
                    ? "INFO"
                    : "ERROR",

            message:
                `Order ${order.status}`,

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

    res.status(201).json(order);

});

app.listen(port, () => {

    console.log(
        `Order Service running on port ${port}`
    );

});