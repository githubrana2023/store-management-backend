import { db } from "@/drizzle/db.js";
import { successResponse } from "@/libs/api-response.js";
import { hasPermissionMiddleware } from "@/middleware/has-permission-middleware.js";
import { storeMemberMiddleware } from "@/middleware/store-member-middleware.js";
import { Hono } from "hono";

const storeCategoryRoute = new Hono()

storeCategoryRoute.use('*', storeMemberMiddleware)

storeCategoryRoute.get('/', hasPermissionMiddleware('categories', 'view'), async (c) => {
    const storeMember = c.get('storeMember')
    const categories = await db.query.categoriesTable.findMany({
        where(categoriesTable, { and, eq }) {
            return and(
                eq(categoriesTable.storeId, storeMember.storeId)
            )
        },
    })

    return c.json(
        successResponse(
            'Store categories retrieved', categories
        ),
        { status: 200 }
    )
})



export default storeCategoryRoute