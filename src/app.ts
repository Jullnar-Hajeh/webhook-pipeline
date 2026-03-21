import express from "express";
import pipelineRoutes from "./modules/pipelines/pipeline.routes";
import webhookRoutes from "./modules/webhooks/webhook.routes"; 
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
    res.status(200).json({
        message: "Server is running"
    });
});

app.use("/pipelines", pipelineRoutes);
app.use("/webhooks", webhookRoutes);

export default app;