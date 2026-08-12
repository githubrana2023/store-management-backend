import { storesTable } from "@/drizzle/schema/stores-table.js";
import z from "zod";
type h = typeof storesTable.$inferInsert
export const storeCreateSchema = z.object({
    name: z.string().trim().nonempty(),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
})