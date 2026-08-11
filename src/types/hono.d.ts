import type { AccessTokenPayload, RefreshTokenPayload } from "@/libs/hono-jwt.ts"
import type { JWTPayload } from "hono/utils/jwt/types"
import type { extend } from "zod/mini"
type TokenPayload = (AccessTokenPayload | RefreshTokenPayload)

declare module 'hono' {
    interface ContextVariableMap {
        jwtPayload: JWTPayload & (AccessTokenPayload | RefreshTokenPayload)
        authUser: JWTPayload & (AccessTokenPayload | RefreshTokenPayload)
    }
}