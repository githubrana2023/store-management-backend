import { failureResponse } from "@/libs/api-response.js";
import { AppError } from "@/libs/app-error.js";
import type { ErrorHandler } from "hono";
import { createMiddleware } from "hono/factory";
import type { ContentfulStatusCode } from "hono/utils/http-status";


export const globalErrorHandler: ErrorHandler = async (error, c) => {

    let response = failureResponse(
        'Something went wrong!',
        'SERVER_ERROR',
        error
    )
    let status: ContentfulStatusCode = 500

    if (error instanceof AppError) {
        response = failureResponse(error.message, error.code, error.details)
        status = error.statusCode
        return c.json(response, { status })
    }

    return c.json(response, { status })
}