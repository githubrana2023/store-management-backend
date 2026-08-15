import { pgTable, uuid, text, timestamp, uniqueIndex, index, boolean } from "drizzle-orm/pg-core";
import { storesTable } from "./stores-table.js";
export const unitsTable = pgTable(
    "units",
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

        shortName: text("short_name")
            .notNull(),
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
        uniqueIndex("units_store_name_unique_idx")
            .on(table.storeId, table.name),

        uniqueIndex("units_store_short_name_unique_idx")
            .on(table.storeId, table.shortName),

        index("units_store_id_idx")
            .on(table.storeId),
    ],
);