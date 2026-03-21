import { NextFunction, Request, Response } from "express";
import { JobService } from "./job.service";

const jobService = new JobService();

export class JobController {
    async getJobStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string; 
            const jobDetails = await jobService.getJobWithDeliveries(id);
            
            res.status(200).json(jobDetails);
        } catch (error) {
            next(error);
        }
    }
}