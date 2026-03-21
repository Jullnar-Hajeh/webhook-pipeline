import { Worker, Job } from "bullmq";
import { eq } from "drizzle-orm";
import { redisConnection } from "../config/redis";
import { db } from "../config/db";
import { jobs } from "../db/schema";
import { processPayload } from "../processing/actions";
import { DeliveryService } from "../modules/deliveries/delivery.service";

const deliveryService = new DeliveryService();

console.log("Worker is starting and listening for jobs...");

export const worker = new Worker(
    "pipeline-jobs",
    async (job: Job) => {
        const { jobId, pipelineId, payload, actionType, actionConfig } = job.data;
        
        console.log(`[Job ${job.id}] Picked up! Pipeline: ${pipelineId}`);

        try {
            await db.update(jobs)
                .set({ status: "processing", updatedAt: new Date() })
                .where(eq(jobs.id, jobId));

            const processedPayload = processPayload(actionType, payload, actionConfig);

            await deliveryService.deliverToSubscribers(pipelineId, jobId, processedPayload);

            await db.update(jobs)
                .set({ 
                    status: "completed", 
                    result: processedPayload,
                    updatedAt: new Date() 
                })
                .where(eq(jobs.id, jobId));

            console.log(`[Job ${job.id}] Successfully completed!`);

        } catch (error: any) {
            console.error(`[Job ${job.id}] Failed:`, error.message);

            await db.update(jobs)
                .set({ 
                    status: "failed", 
                    error: error.message,
                    updatedAt: new Date() 
                })
                .where(eq(jobs.id, jobId));

            throw error;
        }
    },
    {
        connection: redisConnection as any,
        concurrency: 5 
    }
);

worker.on("failed", (job, err) => {
    console.log(`Worker failed job ${job?.id} with error: ${err.message}`);
});