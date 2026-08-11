import 'dotenv/config'

export const config = {
    databaseUrl: process.env.DATABASE_URL!,
    superAdminPassword: process.env.SUPER_ADMIN_PASSWORD!,
    nodeEnv: process.env.NODE_ENV!,
    port: parseInt(process.env.PORT! ?? 3000),
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
    accessTokenExpirationMinutes: parseInt(process.env.ACCESS_TOKEN_EXPIRATION_MINUTES!),
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
    refreshTokenExpirationDays: parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DAYS!),
}