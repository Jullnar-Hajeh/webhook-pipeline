import { Worker } from "bullmq";
import axios from "axios";
import { eq } from "drizzle-orm";
import { redisConnection } from "../config/redis";
import { db } from "../config/db";
import { jobs, pipelines, subscribers } from "../db/schema";
import { processPayload } from "../processing/actions";

console.log("Worker is starting and waiting for jobs...");

export const pipelineWorker = new Worker(
    "pipeline-jobs",
    async (job) => {
        const { jobId, pipelineId, payload } = job.data;
        console.log(`[Worker] Picked up job: ${jobId} for pipeline: ${pipelineId}`);

        try {
            await db.update(jobs).set({ status: "processing" }).where(eq(jobs.id, jobId));

            const pipeline = await db.query.pipelines.findFirst({
                where: eq(pipelines.id, pipelineId)
            });

            if (!pipeline) throw new Error("Pipeline not found");

            const processedData = processPayload(pipeline.actionType, payload, pipeline.actionConfig);

            const activeSubscribers = await db.query.subscribers.findMany({
                where: eq(subscribers.pipelineId, pipelineId)
            });

            const deliveryPromises = activeSubscribers.map(async (sub) => {
                let attempts = 0;
                const maxAttempts = 3; 
                let success = false;

                while (attempts < maxAttempts && !success) {
                    try {
                        attempts++;
                        await axios.post(sub.url, processedData, { timeout: 5000 });
                        success = true;
                        console.log(`[Worker] Delivered to ${sub.url} on attempt ${attempts}`);
                    } catch (error) {
                        console.error(`[Worker] Failed delivery to ${sub.url} (Attempt ${attempts})`);
                        if (attempts >= maxAttempts) {
                            console.error(`[Worker] Max retries reached for ${sub.url}`);
                        } else {
                            await new Promise(res => setTimeout(res, 1000));
                        }
                    }
                }
                return success;
            });

            await Promise.all(deliveryPromises);

            await db.update(jobs)
                .set({ status: "completed", result: processedData, updatedAt: new Date() })
                .where(eq(jobs.id, jobId));

            console.log(`[Worker] Job ${jobId} completed successfully`);

        } catch (error: any) {
            console.error(`[Worker] Job ${jobId} failed: ${error.message}`);
            await db.update(jobs)
                .set({ status: "failed", updatedAt: new Date() })
                .where(eq(jobs.id, jobId));
            throw error;
        }
    },
{ connection: redisConnection as any }
);