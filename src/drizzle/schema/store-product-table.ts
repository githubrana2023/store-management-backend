import { pgTable, uuid, text, timestamp, uniqueIndex, index, boolean, numeric } from "drizzle-orm/pg-core";
import { storesTable } from "./stores-table.js";
import { storeCategoriesTable } from "./store-category-table.js";
import { storeUnitsTable } from "./store-unit-table.js";

export const storeProductsTables = pgTable(
    "products",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        storeId: uuid("store_id")
            .notNull()
            .references(() => storesTable.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),

        categoryId: uuid("category_id")
            .references(() => storeCategoriesTable.id, {
                onDelete: "set null",
                onUpdate: "cascade",
            }),

        unitId: uuid("unit_id")
            .notNull()
            .references(() => storeUnitsTable.id, {
                onDelete: "restrict",
                onUpdate: "cascade",
            }),
        name: text("name")
            .notNull(),

        sku: text("sku"),

        barcode: text("barcode"),

        description: text("description"),

        purchasePrice: numeric("purchase_price", {
            precision: 12,
            scale: 2,
        }),

        sellingPrice: numeric("selling_price", {
            precision: 12,
            scale: 2,
        }),

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
        uniqueIndex("products_store_sku_unique_idx")
            .on(table.storeId, table.sku),

        uniqueIndex("products_store_barcode_unique_idx")
            .on(table.storeId, table.barcode),

        index("products_store_id_idx")
            .on(table.storeId),

        index("products_category_id_idx")
            .on(table.categoryId),

        index("products_unit_id_idx")
            .on(table.unitId),

    ],
);