#  Webhook-Driven Task Processing Pipeline

A robust, asynchronous, and reliable webhook processing service built with TypeScript, Node.js, and Docker. Think of it as a simplified Zapier: it ingests incoming webhooks, queues them for background processing, applies user-defined transformations, and delivers the results to registered subscribers with robust retry logic.

##  Tech Stack
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL, Drizzle ORM
- **Queue System:** Redis, BullMQ
- **Validation:** Zod
- **Infrastructure:** Docker & Docker Compose
- **CI/CD:** GitHub Actions

---

##  Architecture & Design Decisions

This project is built with scalability, reliability, and clean code principles in mind. Here are the core architectural decisions:

1. **Clean Separation of Concerns (Modular Pattern):** The application is divided into distinct modules (`pipelines`, `jobs`, `webhooks`). Each module strictly follows the `Controller -> Service -> Routes` pattern. This keeps business logic isolated from HTTP transport layers.
   
2. **Asynchronous Processing (Reliability):**
   Instead of processing webhooks synchronously (which risks timeouts and lost data during traffic spikes), the ingestion API immediately responds with a `202 Accepted` and offloads the heavy lifting to a **BullMQ** queue backed by **Redis**.

3. **Robust Delivery & Retry Logic:**
   The background worker handles data transformation and delivery. If a subscriber's URL is down, the worker implements a resilient **Retry Logic** (up to 3 attempts with a 1-second delay) before marking a job as failed.

4. **Type Safety at the Edge:**
   **Zod** is used for strict runtime validation of incoming payloads, ensuring bad data never reaches the database or the queue. Coupled with **TypeScript**, the codebase is safe from edge-case crashes.

5. **Containerization:**
   The entire stack (API, Worker, PostgreSQL, Redis) runs seamlessly via a single `docker-compose.yml` file, ensuring parity across all environments.

---

##  Processing Actions (Transformations)
The pipeline supports three distinct creative processing actions:
1. `uppercase`: Converts all string values in the JSON payload to UPPERCASE.
2. `extract-fields`: Filters the payload to only include specific keys defined in the `actionConfig`.
3. `add-metadata`: Injects a `_metadata` object into the payload containing the processing timestamp and a custom tag.

---

##  Setup & Installation

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose

### Running the Project (One-Click Start)
Simply run the following command in the root directory:
```bash
docker compose up --build
```
This will automatically:
1. Spin up PostgreSQL and Redis.
2. Run database migrations.
3. Start the API Server on `http://localhost:3000`.
4. Start the Background Worker.

---

##  API Documentation

### 1. Pipelines
- **POST `/pipelines`** - Create a new pipeline.
- **GET `/pipelines`** - List all pipelines.
- **GET `/pipelines/:id`** - Get pipeline details.
- **PUT `/pipelines/:id`** - Update pipeline config.
- **DELETE `/pipelines/:id`** - Delete a pipeline.
- **GET `/pipelines/:id/jobs`** - Get all jobs (history) for a specific pipeline.

### 2. Webhook Ingestion
- **POST `/webhooks/:webhookKey`** - *Description:* The entry point for incoming data. Queues the payload for processing.

### 3. Jobs Status
- **GET `/jobs/:id`**
  - *Description:* Check the exact status (`pending`, `processing`, `completed`, `failed`), result, and delivery history of a specific job.

---

##  CI/CD Pipeline
This repository uses GitHub Actions to ensure code quality. On every push or pull request to the `main` branch, the CI pipeline automatically installs dependencies and builds the TypeScript code to catch compile-time errors.