import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../../config/db";
import { jobs, pipelines } from "../../db/schema";
import { pipelineQueue } from "../../queue/queue";

export class WebhookService {
    async processWebhook(webhookKey: string, payload: any) {
        const pipelineRows = await db
            .select()
            .from(pipelines)
            .where(eq(pipelines.webhookKey, webhookKey))
            .limit(1);

        const pipeline = pipelineRows[0];

        if (!pipeline) {
            const error: any = new Error("Invalid Webhook URL - Pipeline not found");
            error.statusCode = 404;
            throw error;
        }

        const jobId = randomUUID();
        await db.insert(jobs).values({
            id: jobId,
            pipelineId: pipeline.id,
            status: "pending",
            payload: payload,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await pipelineQueue.add(
            "process-pipeline-job",
            {
                jobId,
                pipelineId: pipeline.id,
                payload,
                actionType: pipeline.actionType,
                actionConfig: pipeline.actionConfig,
            },
            {
                jobId: jobId,
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
            }
        );

        return {
            message: "Webhook received successfully and queued for processing",
            jobId,
        };
    }
}