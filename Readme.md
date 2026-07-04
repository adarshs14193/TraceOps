
# TraceOps - Distributed Tracing & Failure Analysis Platform

> A lightweight distributed tracing and failure analysis platform built from scratch using Node.js microservices.

TraceOps helps developers understand how a request flows through a distributed system by propagating trace IDs, collecting centralized logs, and analyzing request timelines.

---

## Why TraceOps?

Debugging distributed systems becomes difficult as the number of microservices grows.

Consider a request flowing through multiple services:

```
Client
   │
   ▼
Order Service
   │
   ▼
Payment Service
   │
   ▼
Inventory Service
```

If something fails, each service has its own logs.

Developers often need to manually inspect multiple terminals or log files to identify where the request failed.

TraceOps solves this by:

- Propagating a unique Trace ID across services
- Collecting logs into a centralized logging service
- Reconstructing the complete request timeline
- Identifying failures and execution details

---

# Features

- Distributed Trace ID propagation
- Centralized logging
- Request timeline reconstruction
- Failure detection
- Total request duration calculation
- Microservice architecture
- Express middleware for request context propagation

---

# Architecture

```
                    Client
                       │
                       ▼
                Order Service
                       │
             trace-id propagated
                       │
                       ▼
               Payment Service
                 │           │
                 │           │
                 ▼           ▼
          Logger Service  (stores logs)
                 ▲
                 │
                 │
          Analyzer Service
```

---

# Services

## Order Service

Responsible for:

- Creating orders
- Calling the Payment Service
- Propagating Trace IDs
- Sending structured logs to Logger Service

---

## Payment Service

Responsible for:

- Processing payments
- Receiving propagated Trace IDs
- Sending logs to Logger Service

---

## Logger Service

Responsible for:

- Receiving logs from all services
- Storing structured log events
- Returning logs via REST API

Logger performs **no analysis**.

---

## Analyzer Service

Responsible for:

- Fetching logs from Logger Service
- Grouping logs by Trace ID
- Sorting events chronologically
- Detecting failures
- Building request timelines

---

# Request Flow

```
Client

↓

POST /order

↓

Order Service

↓

POST /pay

↓

Payment Service

↓

POST /log

↓

Logger Service

↓

GET /analyse/:traceId

↓

Analyzer Service
```

---

# Log Structure

Every service emits structured logs.

```json
{
  "traceId": "abc123",
  "orderId": "ORD-1",
  "service": "payment-service",
  "level": "INFO",
  "message": "Payment Successful",
  "timestamp": "2026-07-03T14:30:21Z"
}
```

---

# Analyzer Response

Example:

```json
{
  "traceId": "abc123",
  "status": "SUCCESS",
  "totalEvents": 2,
  "servicesVisited": [
    "order-service",
    "payment-service"
  ],
  "totalDuration": "42 ms",
  "failedService": null,
  "timeline": [
    ...
  ]
}
```

---

# Technologies Used

- Node.js
- Express.js
- Axios
- UUID (crypto.randomUUID)
- REST APIs

---

# What I Learned

Building TraceOps helped me understand:

- Microservice architecture
- Service-to-service communication
- HTTP request propagation
- Express middleware
- Distributed tracing fundamentals
- Centralized logging
- Separation of concerns
- Failure analysis

---



# Repository Structure

```
traceops/

├── order-service/
├── payment-service/
├── logger-service/
├── analyzer-service/
├── README.md
└── docs/
```

---

# Inspiration

Modern distributed systems rely on tools like OpenTelemetry, Jaeger and Datadog to trace requests across services.

TraceOps is a lightweight educational implementation built from scratch to understand the underlying concepts before using production-grade tooling.
