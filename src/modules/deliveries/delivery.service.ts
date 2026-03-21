import axios from "axios";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../../config/db";
import { deliveries, subscribers } from "../../db/schema";

export class DeliveryService {
    async deliverToSubscribers(pipelineId: string, jobId: string, processedPayload: any) {
        const pipelineSubscribers = await db
            .select()
            .from(subscribers)
            .where(eq(subscribers.pipelineId, pipelineId));

        if (pipelineSubscribers.length === 0) return;

        const deliveryPromises = pipelineSubscribers.map(async (sub) => {
            const deliveryId = randomUUID();
            const startTime = Date.now();
            let status = "success";
            let responseBody = null;

            try {
                const response = await axios.post(sub.url, processedPayload, {
                    timeout: 5000 
                });
                responseBody = response.data;
            } catch (error: any) {
                status = "failed";
                responseBody = error.response?.data || error.message;
            }

            const endTime = Date.now();

            await db.insert(deliveries).values({
                id: deliveryId,
                jobId: jobId,
                subscriberId: sub.id,
                status,
                requestPayload: processedPayload,
                responseBody,
                statusCode: status === "success" ? 200 : 500, 
                durationMs: endTime - startTime,
                createdAt: new Date(),
            });

            if (status === "failed") {
                throw new Error(`Failed to deliver to ${sub.url}`);
            }
        });

        await Promise.allSettled(deliveryPromises);
    }
}