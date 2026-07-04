import express from "express";
import axios from "axios";

const app = express();
const port = 6000;

app.use(express.json());

const LOGGER_SERVICE_URL =
    process.env.LOGGER_SERVICE_URL ||
    "http://localhost:5000";

app.get("/analyse/:traceId", async (req, res) => {

    const { traceId } = req.params;

    try {

        // Fetch only logs for this trace
        const response = await axios.get(
            `${LOGGER_SERVICE_URL}/logs/${traceId}`
        );

        const traceLogs = response.data;

        if (traceLogs.length === 0) {

            return res.status(404).json({
                error: "Trace not found"
            });

        }

        // Sort logs chronologically
        traceLogs.sort(
            (a, b) =>
                new Date(a.timestamp) -
                new Date(b.timestamp)
        );

        // Determine status
        const status = traceLogs.some(
            log => log.level === "ERROR"
        )
            ? "FAILED"
            : "SUCCESS";

        // Find failed service
        const failedService =
            traceLogs.find(
                log => log.level === "ERROR"
            )?.service || null;

        // Services visited
        const servicesVisited = [
            ...new Set(
                traceLogs.map(log => log.service)
            )
        ];

        // Calculate total duration
        const startTime = new Date(
            traceLogs[0].timestamp
        );

        const endTime = new Date(
            traceLogs[
                traceLogs.length - 1
            ].timestamp
        );

        const totalDuration =
            endTime.getTime() -
            startTime.getTime();

        res.json({

            traceId,

            status,

            totalEvents: traceLogs.length,

            totalDuration: `${totalDuration} ms`,

            servicesVisited,

            failedService,

            timeline: traceLogs

        });

    }

    catch (err) {

        console.error(err.message);

        res.status(500).json({
            error: err.message
        });

    }

});

app.listen(port, () => {

    console.log(`Analyzer Service running on port ${port}`);

});