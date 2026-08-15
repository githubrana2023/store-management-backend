import { db } from "@/drizzle/db.js";
import { Hono } from "hono";

export const testRoute = new Hono()

testRoute.get('/users', async (c) => {
    return c.json(await db.query.usersTable.findMany())
})

testRoute.get('/stores', async (c) => {
    return c.json(await db.query.storesTable.findMany())
})

testRoute.get('/stores/:storeId/members', async (c) => {
    const storeId = c.req.param('storeId')
    if (!storeId) return c.json({
        message: 'Store Id missing'
    }, 400)
    return c.json(await db.query.storeMembersTable.findMany({
        where: (table, { eq }) => eq(table.storeId, storeId),
        with: {
            user: {
                columns: {
                    name: true,
                    email: true,
                    phone: true
                }
            },
            role: {
                columns: {
                    name: true
                }
            },
            store: {
                columns: {
                    name: true
                }
            },

        },
        columns: { id: true, storeId: true, userId: true, roleId: true }
    }))
})

testRoute.get('/stores/:storeId/roles', async (c) => {
    const storeId = c.req.param('storeId')
    if (!storeId) return c.json({
        message: 'Store Id missing'
    }, 400)
    return c.json(await db.query.storeRolesTable.findMany({
        where: (table, { eq }) => eq(table.storeId, storeId),
        with: {
            store: {
                columns: {
                    name: true
                }
            }
        }
    }))
})


testRoute.get('/members', async (c) => {
    return c.json(await db.query.storeMembersTable.findMany())
})

export default testRoute