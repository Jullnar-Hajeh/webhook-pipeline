import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    if (error instanceof ZodError) {
        return res.status(400).json({
            message: "Validation failed",
            errors: error.format() 
        });
    }

    if (error instanceof Error) {
        const statusCode = (error as any).statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        });
    }

    return res.status(500).json({
        message: "Internal server error"
    });
}