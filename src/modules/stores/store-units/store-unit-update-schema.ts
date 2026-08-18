import z from "zod";


export const storeUnitUpdateSchema = z.object({
    name: z.string().trim().optional(),
    shortName: z.string().trim().optional()
})