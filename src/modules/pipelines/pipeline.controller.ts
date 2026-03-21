import { NextFunction, Request, Response } from "express";
import { PipelineService } from "./pipeline.service";

const pipelineService = new PipelineService();

export class PipelineController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const pipeline = await pipelineService.createPipeline(req.body);
            res.status(201).json(pipeline);
        } catch (error) { next(error); }
    }

    async getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const pipelines = await pipelineService.getAllPipelines();
            res.status(200).json(pipelines);
        } catch (error) { next(error); }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const pipeline = await pipelineService.getPipelineById(req.params.id as string);
            res.status(200).json(pipeline);
        } catch (error) { next(error); }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const pipeline = await pipelineService.updatePipeline(req.params.id as string, req.body);
            res.status(200).json(pipeline);
        } catch (error) { next(error); }
    }

    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await pipelineService.deletePipeline(req.params.id as string);
            res.status(200).json(result);
        } catch (error) { next(error); }
    }

    async getPipelineJobs(req: Request, res: Response, next: NextFunction) {
        try {
            const pipelineJobs = await pipelineService.getPipelineJobs(req.params.id as string);
            res.status(200).json(pipelineJobs);
        } catch (error) { next(error); }
    }
}