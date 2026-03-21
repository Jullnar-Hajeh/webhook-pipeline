import { Router } from "express";
import { PipelineController } from "./pipeline.controller";
import { validate } from "../../middleware/validation";
import { createPipelineSchema, pipelineIdSchema, updatePipelineSchema } from "./pipeline.validation";

const router = Router();
const pipelineController = new PipelineController();

router.post("/", validate(createPipelineSchema), pipelineController.create.bind(pipelineController));
router.get("/", pipelineController.getAll.bind(pipelineController));
router.get("/:id", validate(pipelineIdSchema), pipelineController.getById.bind(pipelineController));
router.put("/:id", validate(updatePipelineSchema), pipelineController.update.bind(pipelineController));
router.delete("/:id", validate(pipelineIdSchema), pipelineController.remove.bind(pipelineController));
router.get("/:id/jobs", validate(pipelineIdSchema), pipelineController.getPipelineJobs.bind(pipelineController));

export default router;