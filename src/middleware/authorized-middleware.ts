import { AppError } from "@/libs/app-error.js";
import { createMiddleware } from "hono/factory";

export const platformAuthorizedMiddleware = createMiddleware(
    async (c, next) => {
        const path = c.req.path
        const isAdminPath = path.startsWith('/admin')

        const authUser = c.get('authUser')
        if (!authUser) throw new AppError('Unauthenticated', 401, 'UNAUTHENTICATED')

        if (isAdminPath && authUser.platformRole !== 'ADMIN') throw new AppError('Forbidden Access', 403, 'FORBIDDEN_ACCESS')

        return await next()
    }
)