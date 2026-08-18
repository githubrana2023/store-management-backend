import z from "zod";


export const storeUnitCreateSchema = z.object({
    name: z.string().trim().nonempty(),
    shortName: z.string().trim().nonempty(),
})