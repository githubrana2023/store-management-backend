import z from "zod";


export const storeRoleUpdateSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional()
})