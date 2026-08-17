import { pgTable, uuid, text, timestamp, uniqueIndex, index, boolean } from "drizzle-orm/pg-core";
import { storesTable } from "./stores-table.js";

export const storeCategoriesTable = pgTable(
    "categories",
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

        description: text("description"),
        isDeleted: boolean('is_deleted').notNull().default(false),

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
        uniqueIndex("categories_store_name_unique_idx")
            .on(table.storeId, table.name),

        index("categories_store_id_idx")
            .on(table.storeId),
    ],
);