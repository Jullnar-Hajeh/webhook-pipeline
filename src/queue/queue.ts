import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const pipelineQueue = new Queue("pipeline-jobs", {
  connection: redisConnection as any, 
});

console.log("Queue file loaded");
