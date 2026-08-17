import z from "zod";


export const storeCategoryUpdateSchema = z.object({
    name: z.string().trim().optional(),
    description: z.string().trim().optional(),
})