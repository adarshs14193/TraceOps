import { randomUUID } from "crypto";

export function traceMiddleware(req, res, next) {
    const traceId = req.headers["trace-id"] || randomUUID();
    req.traceId = traceId;
    console.log(`[${traceId}] ${req.method} ${req.originalUrl}`);
    next();
}