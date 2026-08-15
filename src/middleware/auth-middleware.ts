import { type AccessTokenPayload, type RefreshTokenPayload } from '@/libs/hono-jwt.js';
import { config } from "@/config/evn.js";
import { AppError } from "@/libs/app-error.js";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";
import { publicRoutes } from '@/routes/constants.js';


export const authRequired = createMiddleware(
    async (c, next) => {
        const path = c.req.path

        if (publicRoutes.includes(path) || path.startsWith('/retrieve')) {
            return await next()
        }

        const authorization = c.req.header('Authorization')
        if (!authorization) throw new AppError('Token is missing', 401, 'TOKEN_MISSING')
        if (!authorization.startsWith('Bearer ')) throw new AppError('Invalid Token', 400, 'INVALID_TOKEN')
        const token = authorization.slice(7).trim()
        try {
            const decoded = await verify(token, config.accessTokenSecret, 'HS256') as (JWTPayload & AccessTokenPayload)
            if (decoded.type !== 'access') throw new AppError('Invalid Token', 401, 'INVALID_TOKEN')
            c.set('authUser', decoded)
            return await next()
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Invalid Token', 401, 'INVALID_TOKEN', error)
        }
    }
)