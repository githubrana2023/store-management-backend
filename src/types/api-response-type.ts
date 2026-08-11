
export type SuccessResponse<T = unknown> = {
    success: true;
    message: string;
    data: T;
};

export type ErrorResponse = {
    success: false;
    message: string;
    error?: {
        code: string;
        details?: unknown;
    };
};