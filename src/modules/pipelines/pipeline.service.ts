import { randomUUID } from "crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "../../config/db";
import { jobs, pipelines, subscribers } from "../../db/schema";
import { CreatePipelineInput, UpdatePipelineInput } from "./pipeline.validation";

export class PipelineService {
    async createPipeline(data: CreatePipelineInput) {
        const pipelineId = randomUUID();
        const webhookKey = randomUUID();

        await db.insert(pipelines).values({
            id: pipelineId,
            name: data.name,
            webhookKey,
            actionType: data.actionType,
            actionConfig: data.actionConfig ?? {},
        });

        await db.insert(subscribers).values(
            data.subscribers.map((subscriber) => ({
                id: randomUUID(),
                pipelineId,
                url: subscriber.url,
            }))
        );

        return {
            id: pipelineId,
            name: data.name,
            actionType: data.actionType,
            actionConfig: data.actionConfig ?? {},
            subscribers: data.subscribers,
            webhookUrl: `/webhooks/${webhookKey}`
        };
    }

    async getAllPipelines() {
        const pipelineRows = await db.select().from(pipelines).orderBy(desc(pipelines.createdAt));
        const result = [];

        for (const pipeline of pipelineRows) {
            const subscriberRows = await db.select().from(subscribers).where(eq(subscribers.pipelineId, pipeline.id));
            result.push({ ...pipeline, subscribers: subscriberRows });
        }
        return result;
    }

    async getPipelineById(id: string) {
        const pipelineRows = await db.select().from(pipelines).where(eq(pipelines.id, id)).limit(1);
        const pipeline = pipelineRows[0];

        if (!pipeline) {
            const error: any = new Error("Pipeline not found");
            error.statusCode = 404;
            throw error;
        }

        const subscriberRows = await db.select().from(subscribers).where(eq(subscribers.pipelineId, id));
        return { ...pipeline, subscribers: subscriberRows };
    }

    async updatePipeline(id: string, data: UpdatePipelineInput) {
        const existingPipeline = await this.getPipelineById(id);

        await db.update(pipelines).set({
            name: data.name ?? existingPipeline.name,
            actionType: data.actionType ?? existingPipeline.actionType,
            actionConfig: data.actionConfig ?? existingPipeline.actionConfig,
            updatedAt: new Date()
        }).where(eq(pipelines.id, id));

        return this.getPipelineById(id);
    }

    async deletePipeline(id: string) {
        await this.getPipelineById(id); 
        await db.delete(pipelines).where(eq(pipelines.id, id));
        return { message: "Pipeline deleted successfully" };
    }

    async getPipelineJobs(pipelineId: string) {
        await this.getPipelineById(pipelineId);
        return db.select().from(jobs).where(eq(jobs.pipelineId, pipelineId)).orderBy(desc(jobs.createdAt));
    }
}