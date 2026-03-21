import { pgTable, text, timestamp, uuid, jsonb, boolean } from "drizzle-orm/pg-core";

export const pipelines = pgTable("pipelines", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  webhookKey: uuid("webhook_key").notNull().unique(), 
  actionType: text("action_type").notNull(), 
  actionConfig: jsonb("action_config").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  pipelineId: uuid("pipeline_id")
    .references(() => pipelines.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  pipelineId: uuid("pipeline_id")
    .references(() => pipelines.id, { onDelete: "cascade" })
    .notNull(),
  payload: jsonb("payload").notNull(), 
  status: text("status").notNull().default("pending"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});