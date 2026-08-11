import type { ErrorResponse, SuccessResponse } from "@/types/api-response-type.js";

export const successResponse = <T>(message: string, data: T): SuccessResponse<T> => {
    return {
        success: true,
        message,
        data,
    };
}



export const failureResponse = (message: string, code: string, details?: unknown): ErrorResponse => {
    return {
        success: false,
        message,
        error: {
            code,
            details,
        }
    };
}