import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, uniqueIndex, index } from "drizzle-orm/pg-core";
import { platformRolePermissionsTable } from "./platform-role-permission-table.js";

/* ========================================================= PLATFORM PERMISSIONS ========================================================= */ /** * Platform-level permissions. * * Examples: * * resource action * ------------------------ * users view * users create * users update * users suspend * * stores view * stores create * stores update * stores suspend * * plans view * plans create * plans update * plans delete * * subscriptions view * subscriptions manage */

export const platformPermissionsTable = pgTable("platform_permissions",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        resource: text("resource").notNull(),
        action: text("action").notNull(),
        description: text("description"),
        createdAt: timestamp("created_at",
            {
                withTimezone: true,

            }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at",
            {
                withTimezone: true,

            }).notNull().defaultNow().$onUpdate(() => new Date()),
    },
    (table) => [ /** * Example: * * users + view * * can only exist once. */ uniqueIndex("platform_permissions_resource_action_unique_idx",

    ).on(table.resource,
        table.action,

    ),
    index("platform_permissions_resource_idx").on(table.resource),
    index("platform_permissions_action_idx").on(table.action),

    ],
);



/* ------------------------- PLATFORM PERMISSIONS ------------------------- */
export const platformPermissionsRelations = relations(
    platformPermissionsTable,
    ({ many }) => (
        {
            roles: many(platformRolePermissionsTable),
        }
    ),
);