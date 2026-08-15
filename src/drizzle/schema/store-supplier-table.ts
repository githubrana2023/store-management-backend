import { pgTable, uuid, text, timestamp, uniqueIndex, index, boolean, numeric } from "drizzle-orm/pg-core";
import { storesTable } from "./stores-table.js"; 

export const suppliersTable = pgTable(
    "suppliers",
    {
        id: uuid("id")
            .unique()
            .notNull()
            .defaultRandom()
            .primaryKey(),

        storeId: uuid("store_id")
            .notNull()
            .references(() => storesTable.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),

        name: text("name")
            .notNull(),

        phone: text("phone"),

        email: text("email"),

        address: text("address"),

        notes: text("notes"),
        isBlocked: boolean('is_blocked').notNull().default(false),

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
        uniqueIndex("suppliers_store_name_unique_idx")
            .on(table.storeId, table.name),

        index("suppliers_store_id_idx")
            .on(table.storeId),
    ],
);