import z from "zod";


export const storeRoleCreateSchema = z.object({
    name: z.string(),
    description: z.string().optional()
})