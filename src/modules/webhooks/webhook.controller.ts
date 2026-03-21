import { NextFunction, Request, Response } from "express";
import { WebhookService } from "./webhook.service";

const webhookService = new WebhookService();

export class WebhookController {
    async handleIncomingWebhook(req: Request, res: Response, next: NextFunction) {
        try {
            const webhookKey = req.params.key as string;
            const payload = req.body;

            const result = await webhookService.processWebhook(webhookKey, payload);
            
            res.status(202).json(result);
        } catch (error) {
            next(error);
        }
    }
}