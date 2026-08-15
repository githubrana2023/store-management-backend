import { config } from "@/config/evn.js";
import type { PlatformUserRoleType } from "@/types/platform-user-role-type.js";
import { sign } from "hono/jwt";

type AccessTokenType = 'access'
type RefreshTokenType = 'refresh'

export type AccessTokenPayload = {
    sub: string;
    platformRole: PlatformUserRoleType;
    type: AccessTokenType
}

export type RefreshTokenPayload = {
    sub: string;
    platformRole: PlatformUserRoleType;
    type: RefreshTokenType
}

export const createAccessToken = async (payload: AccessTokenPayload, options?: {
    isTesting?: boolean;
    expireInMinutes: number
}): Promise<string> => {
    const now = Math.floor(Date.now() / 1000)
    const exp = (options?.isTesting) ?
        now + 60 * config.accessTokenExpirationMinutes :
        now + 60 * (options && options.expireInMinutes ? options.expireInMinutes : 5); // 5 min expiration

    const token = await sign({
        ...payload,
        exp,
        iat: now
    }, config.accessTokenSecret);
    return `Bearer ${token}`;
}

export const createRefreshToken = async (payload: RefreshTokenPayload, isTesting?: boolean): Promise<string> => {
    const now = Math.floor(Date.now() / 1000)
    const exp = !isTesting ?
        now + 60 * config.refreshTokenExpirationDays :
        now + 60 * 60 * 24; // 1 day expiration
    const token = await sign({
        ...payload,
        exp,
        iat: now
    }, config.refreshTokenSecret);



    return `Bearer ${token}`;
}