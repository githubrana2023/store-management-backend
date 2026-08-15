import { Hono } from "hono";
import { authLoginSchema } from "./auth-login-schema.js";
import { failureResponse, successResponse } from "@/libs/api-response.js";
import { db } from "@/drizzle/db.js";
import bcrypt from "bcryptjs";
import { AppError } from "@/libs/app-error.js";
import { createAccessToken, createRefreshToken } from "@/libs/hono-jwt.js";
import { authRegisterSchema } from "./auth-register-schema.js";
import { eq } from "drizzle-orm";
import { usersTable } from "@/drizzle/schema/users-tables.js";

const authRoutes = new Hono()

/**
 * ***********************************************************************
 *!                      Auth Routes (Login)
 * ***********************************************************************
 */
authRoutes.post("/login", async (c) => {
    const body = await c.req.json();
    const validation = authLoginSchema.safeParse(body);
    if (!validation.success) return c.json(
        failureResponse("Invalid request body", "INVALID_REQUEST_BODY", validation.error),
        { status: 400 }
    )

    const { phoneOrEmail, password } = validation.data;

    // Check if the user exists in the database
    const existUser = await db.query.usersTable.findFirst({
        where: (usersTable, { eq, or }) => or(
            eq(usersTable.phone, phoneOrEmail),
            eq(usersTable.email, phoneOrEmail),
        ),
    })
    if (!existUser)
        throw new AppError('User not found!', 404, "NOT_FOUND");

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, existUser.passwordHash);
    if (!isPasswordValid) throw new AppError('Invalid credentials!', 400, "INVALID_CREDENTIALS");

    // Generate a JWT token
    const accessToken = await createAccessToken({
        sub: existUser.id,
        platformRole: existUser.platformRole,
        type: 'access',
    }, { expireInMinutes: 60 })
    const refreshToken = await createRefreshToken({
        sub: existUser.id,
        platformRole: existUser.platformRole,
        type: 'refresh',
    })

    const { passwordHash, ...user } = existUser
    return c.json(
        successResponse(
            'Logged in successfully',
            {
                accessToken,
                refreshToken,
                user
            }
        ),
        { status: 200 }
    )
});








/**
 * ***********************************************************************
 *!                      Auth Routes (Registration)
 * ***********************************************************************
 */


authRoutes.post('/register', async (c) => {
    const body = await c.req.json();
    const validation = authRegisterSchema.safeParse(body);
    if (!validation.success) return c.json(
        failureResponse("Invalid request body", "INVALID_REQUEST_BODY", validation.error),
        { status: 400 }
    )

    const { phone, password, name, email } = validation.data;


    // Check if the user exists in the database
    const existUser = await db.query.usersTable.findFirst({
        where: (usersTable, { eq, or }) => or(
            eq(usersTable.phone, phone),
            email ? eq(usersTable.email, email) : undefined
        ),
    })
    if (existUser)
        throw new AppError('User already exist', 400, "ALREADY_EXIST");

    const salt = await bcrypt.genSalt(10)
    // Verify the password
    const passwordHashed = await bcrypt.hash(password, salt);
    const [newUser] = await db.insert(usersTable).values({
        name,
        phone,
        email,
        passwordHash: passwordHashed,
        platformRole: 'USER'
    }).returning()
    const { passwordHash, ...user } = newUser
    return c.json(
        successResponse(
            'Register successfully',
            user
        ),
        { status: 201 }
    )
})

export default authRoutes;