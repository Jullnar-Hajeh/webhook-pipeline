import { z } from "zod";

export const createPipelineSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Pipeline name is required"),
        actionType: z.enum(["extract-fields", "uppercase", "add-metadata"]),
        actionConfig: z.record(z.string(), z.any()).optional().default({}),
        subscribers: z.array(
            z.object({
                url: z.string().url("Subscriber url must be a valid URL")
            })
        ).min(1, "At least one subscriber is required")
    })
});

export const updatePipelineSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid pipeline id")
    }),
    body: z.object({
        name: z.string().min(1).optional(),
        actionType: z.enum(["extract-fields", "uppercase", "add-metadata"]).optional(),
        actionConfig: z.record(z.string(), z.any()).optional()
    })
});

export const pipelineIdSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid pipeline id")
    })
});

export type CreatePipelineInput = z.infer<typeof createPipelineSchema>["body"];
export type UpdatePipelineInput = z.infer<typeof updatePipelineSchema>["body"];