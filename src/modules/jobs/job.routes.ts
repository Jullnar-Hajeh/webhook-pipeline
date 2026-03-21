import { Router } from "express";
import { JobController } from "./job.controller";
import { z } from "zod";
import { validate } from "../../middleware/validation";

const router = Router();
const jobController = new JobController();

const jobIdSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid job id format")
    })
});

router.get(
    "/:id",
    validate(jobIdSchema),
    jobController.getJobStatus.bind(jobController)
);

export default router;