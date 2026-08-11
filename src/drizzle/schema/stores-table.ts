
import { relations } from "drizzle-orm";
import {
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";
import { storeMembersTable } from "./store-members-table.js";
import { storeRolesTable } from "./store-role-table.js";

/* =========================================================
   !ENUMS CONSTANTS
   ========================================================= 
   */


export const STORE_STATUS = [
    "ACTIVE",
    "INACTIVE",
    "SUSPENDED",
] as const


/* =========================================================
   ENUMS
   ========================================================= */

export const storeStatusEnum = pgEnum("store_status", STORE_STATUS);

/* =========================================================
   STORES
   ========================================================= */

export const storesTable = pgTable(
    "stores",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        name: text("name").notNull(),

        slug: text("slug").notNull(),

        phone: text("phone"),

        address: text("address"),

        status: storeStatusEnum("status")
            .notNull()
            .default("ACTIVE"),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        uniqueIndex("stores_slug_unique_idx").on(table.slug),

        index("stores_status_idx").on(table.status),
    ],
);

/* =========================================================
   RELATIONS
   ========================================================= */


export const storesTableRelations = relations(storesTable, ({ many }) => ({
    members: many(storeMembersTable),
    roles: many(storeRolesTable),
}));
