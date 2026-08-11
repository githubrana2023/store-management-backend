import z from "zod";


export const authLoginSchema = z.object({
    phoneOrEmail: z.string().nonempty({ message: "Phone Or Email is required" }).trim(),
    password: z.string().min(1, { message: "Password is required" }),
});