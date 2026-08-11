
/* ========================================================= 
            STORE ROLES
 ========================================================= */
/** * Dynamic roles belonging to a specific store. * * Every newly-created store should receive: * * OWNER * STAFF * * These are system roles. * * Store owners can later create: * * CASHIER * MANAGER * ACCOUNTANT * INVENTORY MANAGER * etc. */

import { pgTable, uuid, text, timestamp, uniqueIndex, index, boolean } from "drizzle-orm/pg-core";
import { storesTable } from "./stores-table.js";
import { relations } from "drizzle-orm";
import { storeMembersTable } from "./store-members-table.js";
import { storeRolePermissionsTable } from "./store-role-permission-table.js";



export const storeRolesTable = pgTable("store_roles",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        storeId: uuid("store_id").notNull().references(() => storesTable.id, { onDelete: "cascade", onUpdate: "cascade", }),
        name: text("name").notNull(),
        description: text("description"),
        /** * System roles are created by the application. * * Example: * * OWNER -> true * STAFF -> true * CASHIER -> false */
        isSystem: boolean("is_system").notNull().default(false),
        createdAt: timestamp("created_at", { withTimezone: true, }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true, }).notNull().defaultNow().$onUpdate(() => new Date()),
    },
    (table) => [
    /** * Role names must be unique inside a store. * * Store A can have: * * Cashier * * Store B can also have: * * Cashier */ uniqueIndex("store_roles_store_name_unique_idx").on(table.storeId, table.name,), index("store_roles_store_id_idx").on(table.storeId),
    ],
);

export const storeRolesRelations = relations(storeRolesTable, ({ one, many }) => (
    {
        store: one(storesTable, { fields: [storeRolesTable.storeId], references: [storesTable.id], }),
        members: many(storeMembersTable),
        permissions: many(storeRolePermissionsTable),
    }
));