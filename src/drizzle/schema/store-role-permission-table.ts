import { pgTable, uuid, timestamp, uniqueIndex, index, text, boolean } from "drizzle-orm/pg-core";
import { storeRolesTable } from "./store-role-table.js";
import { storePermissionsTable } from "./store-permission-table.js";


/* ========================================================= STORE ROLE PERMISSIONS ========================================================= */ /** * Connects a dynamic store role to a dynamic permission. * * Example: * * Cashier * ↓ * sales.create * sales.view * customer.create */
export const storeRolePermissionsTable = pgTable("store_role_permissions",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        roleId: uuid("role_id").notNull().references(() => storeRolesTable.id, { onDelete: "cascade", onUpdate: "cascade", }),
        permissionId: uuid("permission_id").notNull().references(() => storePermissionsTable.id, { onDelete: "cascade", onUpdate: "cascade", }),
        // isActivePermission:boolean('is_active_permission').notNull().default(true),
        createdAt: timestamp("created_at", { withTimezone: true, }).notNull().defaultNow(),
    },
    (table) => [ /** * Prevent duplicate permission assignments. */
        uniqueIndex("store_role_permissions_role_permission_unique_idx",).on(table.roleId, table.permissionId,),
        index("store_role_permissions_role_id_idx").on(table.roleId), index("store_role_permissions_permission_id_idx",).on(table.permissionId),],
);