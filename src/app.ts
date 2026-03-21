import express from "express";
import pipelineRoutes from "./modules/pipelines/pipeline.routes";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
    res.status(200).json({ message: "Server is running" });
});

app.use("/pipelines", pipelineRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;