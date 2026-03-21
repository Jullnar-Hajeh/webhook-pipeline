import { ZodObject, ZodSchema } from "zod";
import { NextFunction, Request, Response } from "express";

export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                params: req.params,
                query: req.query
            });
            next();
        } catch (error) {
            next(error);
        }
    };
};