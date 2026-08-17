import z from "zod";


export const storeCategoryCreateSchema = z.object({
    name: z.string().nonempty().trim(),
    description: z.string().trim().optional(),
})