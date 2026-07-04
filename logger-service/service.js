import express from "express";

const app = express();
const port = 5000;

app.use(express.json());

const logs = [];

// Receive logs from microservices
app.post("/log", (req, res) => {

    const { traceId, orderId, service, level, message, timestamp } = req.body;

    if (!traceId || !orderId || !service || !level || !message || !timestamp) {
        return res.status(400).json({
            error: "All log fields are required"
        });
    }

    const logEntry = {
        traceId,
        orderId,
        service,
        level,
        message,
        timestamp
    };

    logs.push(logEntry);

    console.log(`[LOGGER]`, logEntry);

    return res.status(201).json({
        success: true
    });

});

// Return all logs
app.get("/logs", (req, res) => {

    res.json(logs);

});

// Return logs for a single trace (useful later)
app.get("/logs/:traceId", (req, res) => {

    const { traceId } = req.params;

    const traceLogs = logs.filter(
        log => log.traceId === traceId
    );

    res.json(traceLogs);

});

app.listen(port, () => {
    console.log(`Logger Service running on port ${port}`);
});