import { STORE_MEMBER_STATUS } from "@/drizzle/schema/store-members-table.js";
import z from "zod";


export const storeMemberUpdateSchema = z.object({
    roleId: z.string().optional(),
})