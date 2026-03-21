import { Router } from "express";
import { WebhookController } from "./webhook.controller";

const router = Router();
const webhookController = new WebhookController();

router.post("/:key", webhookController.handleIncomingWebhook.bind(webhookController));

export default router;