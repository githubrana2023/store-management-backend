import z from "zod";


export const storeRoleCreateSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    actions: z.array(z.enum(['create', 'view', 'delete', 'update'])).optional()
})

type S = z.infer<typeof storeRoleCreateSchema>