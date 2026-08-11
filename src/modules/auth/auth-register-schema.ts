import z from "zod";


export const authRegisterSchema = z.object({
    name: z.string().trim().nonempty(),
    email: z.email().optional(),
    phone: z.string().trim().nonempty(),
    password: z.string().trim().nonempty(),
})