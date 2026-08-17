import { pgTable, uuid, text, timestamp, uniqueIndex, index, boolean, numeric } from "drizzle-orm/pg-core";
import { storesTable } from "./stores-table.js";


export const storeCustomersTable = pgTable(
    "customers",
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

        isActive: boolean("is_active")
            .notNull()
            .default(true),

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
        index("customers_store_id_idx")
            .on(table.storeId),

        index("customers_store_phone_idx")
            .on(table.storeId, table.phone),
    ],
);