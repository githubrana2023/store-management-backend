import { db } from "@/drizzle/db.js";
import { storeRolesTable } from "@/drizzle/schema/store-role-table.js";
import { failureResponse, successResponse } from "@/libs/api-response.js";
import { hasPermissionMiddleware } from "@/middleware/has-permission-middleware.js";
import { storeMemberMiddleware } from "@/middleware/store-member-middleware.js";
import { Hono } from "hono";
import { storeRoleCreateSchema } from "./store-roles-create-schema.js";
import { AppError } from "@/libs/app-error.js";

const storeRoleRoutes = new Hono()

storeRoleRoutes.use('*', storeMemberMiddleware)

storeRoleRoutes.post('/', hasPermissionMiddleware('roles', 'create'), async (c) => {
    const storeMember = c.get('storeMember')
    const body = await c.req.json()
    const validation = storeRoleCreateSchema.safeParse(body)
    if (!validation.success) return c.json(
        failureResponse(
            'Invalid fields!',
            'INVALID_FIELDS'
        ),
        { status: 400 }
    )

    const { name, description } = validation.data

    const existRole = await db.query.storeRolesTable.findFirst({
        where(storeRoleTable, { and, eq, or }) {
            return and(
                eq(storeRoleTable.name, name),
                eq(storeRoleTable.storeId, storeMember.storeId),
            )
        },
    })

    if (existRole) throw new AppError(
        'Role already exist',
        400,
        'ALREADY_EXIST'
    )


    const [newRole] = await db.insert(storeRolesTable).values({
        name: name.toUpperCase(),
        storeId: storeMember.storeId,
        description,
        isSystem: false
    }).returning()
    return c.json(
        successResponse(
            'Role created successfully',
            {
                storeId: storeMember.storeId,
                newRole
            },
        ),
        { status: 201 }
    )
})

export default storeRoleRoutes