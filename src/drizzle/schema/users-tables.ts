import { pgTable, text, uuid } from "drizzle-orm/pg-core";


export const usersTable = pgTable('users', {
    id:uuid('id').primaryKey().unique().notNull().defaultRandom(),
    name: text('name' ).notNull(),
    phone:text('phone').unique(),
    email: text('email').unique(),
    password:text('password').notNull(),

})