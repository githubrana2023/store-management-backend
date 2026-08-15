import z from "zod";


export const storeMemberCreateSchema = z.object({
    phoneOrEmail: z.string(),
    roleId: z.string()
})