import { Hono } from "hono";
import { authLoginSchema } from "./auth-login-schema.js";
import { failureResponse } from "@/libs/api-response.js";
import { db } from "@/drizzle/db.js";

const authRoutes = new Hono()

/**
 * ***********************************************************************
 *                      Auth Routes (Login)
 * ***********************************************************************
 */
authRoutes.post("/login", async (c) => {
    const body = await c.req.json();
    const validation = authLoginSchema.safeParse(body);
    if (!validation.success) return c.json(
        failureResponse("Invalid request body", "INVALID_REQUEST_BODY", validation.error),
        { status: 400 }
    )

    const { phone, password } = validation.data;
    // Validate the request body
    if (!phone || !password) {
        return c.json({ message: "Email and password are required" }, 400);
    }

    // Check if the user exists in the database
    const user = await db.query.usersTable.findFirst({
        where: (usersTable, { eq }) => eq(usersTable.phone, phone),
    })
    if (!user) {
        return c.json({ message: "Invalid email or password" }, 401);
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return c.json({ message: "Invalid email or password" }, 401);
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, c.env.JWT_SECRET, { expiresIn: "1h" });

    return c.json({
        message: "Login successful",
        token,
    });
});


export default authRoutes;