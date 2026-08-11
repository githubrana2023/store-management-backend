import { pgTable, uuid, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { platformRoleEnum } from "./users-tables.js";
import { platformPermissionsTable } from "./platform-permission-table.js";
import { relations } from "drizzle-orm";

/* ========================================================= PLATFORM ROLE PERMISSIONS ========================================================= */ /** * Connects a fixed platform role to a permission. * * Example: * * ADMIN -> users.view * ADMIN -> users.suspend * ADMIN -> stores.view */


export const platformRolePermissionsTable = pgTable("platform_role_permissions",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        role: platformRoleEnum("role").notNull(),
        permissionId: uuid("permission_id").notNull().references(() => platformPermissionsTable.id,
            {
                onDelete: "cascade",
                onUpdate: "cascade",

            }),
        createdAt: timestamp("created_at",
            {
                withTimezone: true,

            }).notNull().defaultNow(),
    },
    (table) => [uniqueIndex("platform_role_permissions_role_permission_unique_idx",

    ).on(table.role,
        table.permissionId,

    ),
    index("platform_role_permissions_role_idx").on(table.role),
    index("platform_role_permissions_permission_id_idx",

    ).on(table.permissionId),

    ],
);

/* ------------------------- PLATFORM ROLE PERMISSIONS ------------------------- */
export const platformRolePermissionsRelations = relations(
    platformRolePermissionsTable,
    ({ one }) => (
        {
            permission: one(platformPermissionsTable, {
                fields: [platformRolePermissionsTable.permissionId,], references: [platformPermissionsTable.id],
            })
        }
    )
);