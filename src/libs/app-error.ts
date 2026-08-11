import type { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError extends Error {
    public readonly statusCode: ContentfulStatusCode;
    public readonly code: string;
    public readonly details?: unknown;

    constructor(
        message: string,
        statusCode: ContentfulStatusCode,
        code: string,
        details?: unknown
    ) {
        super(message);

        this.name = "AppError";
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;

        Error.captureStackTrace?.(this, AppError);
    }
}