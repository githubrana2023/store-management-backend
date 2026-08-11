// ### Phase 1 — Drizzle PostgreSQL Schema

import {
    boolean,
    index,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { storeMembersTable } from "./store-members-table.js";

/* =========================================================
   ENUMS CONSTANTS
   ========================================================= */

export const USER_STATUS = [
    "ACTIVE",
    "INACTIVE",
    "SUSPENDED",
] as const


/* =========================================================
   ENUMS
   ========================================================= */

export const PLATFORM_ROLE = [
    "USER",
    "ADMIN",
] as const

export const platformRoleEnum = pgEnum("platform_role", PLATFORM_ROLE);

export const userStatusEnum = pgEnum("user_status", USER_STATUS);


/* =========================================================
   USERS
   ========================================================= */

export const usersTable = pgTable(
    "users",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        name: text("name").notNull(),
        email: text("email").unique(),
        phone: text("phone").unique().notNull(),
        passwordHash: text("password_hash").notNull(),
        /** * Platform-level role. * * This is NOT the store role. */
        platformRole: platformRoleEnum("platform_role").notNull().default("USER"),
        createdAt: timestamp("created_at", { withTimezone: true, }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true, }).notNull().defaultNow().$onUpdate(() => new Date()),
    },
    (table) => [index("users_platform_role_idx").on(table.platformRole),

    ],

);


/* =========================================================
   RELATIONS
   ========================================================= */



export const usersTableRelations = relations(usersTable, ({ many }) => ({
    storeMemberships: many(storeMembersTable),
}));
