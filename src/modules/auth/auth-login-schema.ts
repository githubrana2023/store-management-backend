import z from "zod";


export const authLoginSchema = z.object({
    phone: z.string().nonempty({ message: "Phone is required" }).trim(),
    password: z.string().min(1, { message: "Password is required" }),
});