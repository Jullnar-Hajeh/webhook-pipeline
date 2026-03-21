import { eq } from "drizzle-orm";
import { db } from "../../config/db";
import { jobs, deliveries } from "../../db/schema";

export class JobService {
    async getJobWithDeliveries(jobId: string) {
        const jobRows = await db
            .select()
            .from(jobs)
            .where(eq(jobs.id, jobId))
            .limit(1);

        const job = jobRows[0];

        if (!job) {
            const error: any = new Error("Job not found");
            error.statusCode = 404;
            throw error;
        }

        const deliveryAttempts = await db
            .select()
            .from(deliveries)
            .where(eq(deliveries.jobId, jobId));

        return {
            ...job,
            deliveryAttempts
        };
    }
}