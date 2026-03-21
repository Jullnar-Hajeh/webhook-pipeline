import { pgTable, text, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";

export const pipelines = pgTable("pipelines", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    webhookKey: text("webhook_key").notNull().unique(),
    actionType: text("action_type").notNull(),
    actionConfig: jsonb("action_config").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const subscribers = pgTable("subscribers", {
    id: text("id").primaryKey(),
    pipelineId: text("pipeline_id").references(() => pipelines.id, { onDelete: 'cascade' }).notNull(),
    url: text("url").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

export const jobs = pgTable("jobs", {
    id: text("id").primaryKey(),
    pipelineId: text("pipeline_id").references(() => pipelines.id, { onDelete: 'cascade' }).notNull(),
    status: text("status").notNull(), 
    payload: jsonb("payload"),
    result: jsonb("result"),
    error: text("error"),   
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const deliveries = pgTable("deliveries", { 
    id: text("id").primaryKey(),
    jobId: text("job_id").references(() => jobs.id, { onDelete: 'cascade' }).notNull(),
    subscriberId: text("subscriber_id").references(() => subscribers.id, { onDelete: 'cascade' }).notNull(),
    status: text("status").notNull(), 
    requestPayload: jsonb("request_payload"),
    responseBody: jsonb("response_body"),
    statusCode: integer("status_code"),
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at").defaultNow().notNull()
});