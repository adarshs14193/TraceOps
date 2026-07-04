import axios from "axios";

const LOGGER_SERVICE_URL = process.env.LOGGER_SERVICE_URL || "http://localhost:5000";

export async function sendLog(log) {
    try {
        await axios.post(`${LOGGER_SERVICE_URL}/log`, log);
    }
    catch (error) {
        console.error(`Failed to send log with trace-id: [${log.traceId}]`, error.message);
    }

}