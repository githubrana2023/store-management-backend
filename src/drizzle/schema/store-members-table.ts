
import {
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";
import { storesTable } from "./stores-table.js";
import { usersTable } from "./users-tables.js";
import { relations } from "drizzle-orm";

/* =========================================================
   ENUMS CONSTANTS
   ========================================================= */

export const STORE_MEMBER_STATUS = [
    "ACTIVE",
    "INACTIVE",
    "SUSPENDED",
] as const

export const STORE_MEMBER_ROLE = [
    "OWNER",
    "ADMIN",
    "MANAGER",
    "CASHIER",
    "STAFF",
] as const


/* =========================================================
   ENUMS
   ========================================================= */

export const storeMemberRoleEnum = pgEnum("store_member_role", STORE_MEMBER_ROLE);

export const storeMemberStatusEnum = pgEnum("store_member_status", STORE_MEMBER_STATUS);

/* =========================================================
   STORE MEMBERS
   ========================================================= */

export const storeMembersTable = pgTable(
    "store_members",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        storeId: uuid("store_id")
            .notNull()
            .references(() => storesTable.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),

        userId: uuid("user_id")
            .notNull()
            .references(() => usersTable.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),

        role: storeMemberRoleEnum("role")
            .notNull()
            .default("STAFF"),

        status: storeMemberStatusEnum("status")
            .notNull()
            .default("ACTIVE"),

        joinedAt: timestamp("joined_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

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
        uniqueIndex("store_members_store_user_unique_idx").on(
            table.storeId,
            table.userId,
        ),

        index("store_members_store_id_idx").on(table.storeId),

        index("store_members_user_id_idx").on(table.userId),

        index("store_members_role_idx").on(table.role),

        index("store_members_status_idx").on(table.status),
    ],
);



/* =========================================================
   RELATIONS
   ========================================================= */


export const storeMembersTableRelations = relations(
    storeMembersTable,
    ({ one }) => ({
        user: one(usersTable, {
            fields: [storeMembersTable.userId],
            references: [usersTable.id],
        }),

        store: one(storesTable, {
            fields: [storeMembersTable.storeId],
            references: [storesTable.id],
        }),
    }),
);