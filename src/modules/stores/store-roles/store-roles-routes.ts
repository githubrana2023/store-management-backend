import { db } from "@/drizzle/db.js";
import { storeRolesTable } from "@/drizzle/schema/store-role-table.js";
import { failureResponse, successResponse } from "@/libs/api-response.js";
import { hasPermissionMiddleware } from "@/middleware/has-permission-middleware.js";
import { storeMemberMiddleware } from "@/middleware/store-member-middleware.js";
import { Hono } from "hono";
import { storeRoleCreateSchema } from "./store-roles-create-schema.js";
import { AppError } from "@/libs/app-error.js";
import { storeRoleUpdateSchema } from "./store-role-update-schema.js";
import { and, eq } from "drizzle-orm";
import { storeRolePermissionsTable } from "@/drizzle/schema/store-role-permission-table.js";
import { PERMISSION_MAP } from "@/constants/persmission.js";

const storeRoleRoutes = new Hono()

storeRoleRoutes.use('*', storeMemberMiddleware)


/**
 * --------------------------------------------------------------------------------------
 * CREATE ROLE UNDER STORE 
 * --------------------------------------------------------------------------------------
 */
storeRoleRoutes.post('/', hasPermissionMiddleware(PERMISSION_MAP.view.roles), async (c) => {
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

    const { name, description, actions = ['view'] } = validation.data

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

    const storeOwnerRole = await db.query.storeRolesTable.findFirst({
        where(storeRolestable, { and, eq }) {
            return and(
                eq(storeRolestable.name, 'OWNER'),
                eq(storeRolestable.storeId, storeMember.storeId),
                eq(storeRolestable.isSystem, true),
            )
        }
    })

    if (!storeOwnerRole) throw new AppError('Onwer role not found', 404, 'NOT_FOUND')


    const storeOwner = await db.query.storeMembersTable.findFirst({
        where(storeMembersTable, { and, eq }) {
            return and(
                eq(storeMembersTable.storeId, storeMember.storeId),
                eq(storeMembersTable.roleId, storeOwnerRole.id),
            )
        }
    })

    if (!storeOwner) throw new AppError('Store owner not found', 404, 'NOT_FOUND')

    const result = await db.transaction(
        async (tx) => {
            const [newRole] = await tx.insert(storeRolesTable).values({
                name: name.toUpperCase(),
                storeId: storeMember.storeId,
                description,
                isSystem: false
            }).returning()

            if (!newRole) throw new Error('Failed to create store role')
            const permissions = await db.query.storePermissionsTable.findMany(
                {
                    where(storePermissionsTable, { eq, or }) {
                        return or(
                            ...actions.map(action => eq(storePermissionsTable.action, action))
                        )
                    },
                    columns: { id: true }
                }
            )

            await tx.insert(storeRolePermissionsTable).values(
                permissions.map(({ id: permissionId }) => ({
                    permissionId,
                    roleId: newRole.id
                }))
            )

            return newRole
        }
    )



    return c.json(
        successResponse(
            'Role created successfully',
            {
                storeId: storeMember.storeId,
                result
            },
        ),
        { status: 201 }
    )
})



/**
 * --------------------------------------------------------------------------------------
 * GET SINGLE ROLE UNDER STORE 
 * --------------------------------------------------------------------------------------
 */

storeRoleRoutes.get('/:roleId', hasPermissionMiddleware(PERMISSION_MAP.view.roles), async (c) => {
    const storeMember = c.get('storeMember')
    const roleId = c.req.param('roleId')
    if (!roleId) return c.json(
        failureResponse(
            'Missing role id!',
            'MISSING_ID'
        ),
        { status: 400 }
    )

    const existRole = await db.query.storeRolesTable.findFirst({
        where(storeRoleTable, { and, eq }) {
            return and(
                eq(storeRoleTable.id, roleId),
                eq(storeRoleTable.storeId, storeMember.storeId),
            )
        },
    })

    if (!existRole) throw new AppError(
        'Role not found',
        404,
        'NOT_FOUND'
    )


    return c.json(
        successResponse(
            'Role created successfully',
            existRole,
        ),
        { status: 200 }
    )
})


/**
 * --------------------------------------------------------------------------------------
 * UPDATE SINGLE ROLE UNDER STORE 
 * --------------------------------------------------------------------------------------
 */

storeRoleRoutes.patch('/:roleId', hasPermissionMiddleware(PERMISSION_MAP.update.roles), async (c) => {
    const storeMember = c.get('storeMember')
    const roleId = c.req.param('roleId')
    const body = await c.req.json()
    if (!roleId) return c.json(
        failureResponse(
            'Missing role id!',
            'MISSING_ID'
        ),
        { status: 400 }
    )

    const validation = storeRoleUpdateSchema.safeParse(body)
    if (!validation.success) throw validation.error

    const { description, name } = validation.data

    if (name) {
        const roleExistWithSameName = await db.query.storeRolesTable.findFirst({
            where(storeRoleTable, { and, eq }) {
                return and(
                    eq(storeRoleTable.name, name),
                    eq(storeRoleTable.storeId, storeMember.storeId),
                )
            },
        })

        if (roleExistWithSameName) throw new AppError(
            'Role already exist',
            400,
            'ALREADY_EXIST'
        )
    }

    const existRole = await db.query.storeRolesTable.findFirst({
        where(storeRoleTable, { and, eq }) {
            return and(
                eq(storeRoleTable.id, roleId),
                eq(storeRoleTable.storeId, storeMember.storeId),
            )
        },
    })

    if (!existRole) throw new AppError(
        'Role not found',
        404,
        'NOT_FOUND'
    )

    const updatedRole = await db.update(storeRolesTable)
        .set({
            name,
            description
        })
        .where(
            and(
                eq(storeRolesTable.id, existRole.id),
                eq(storeRolesTable.storeId, storeMember.storeId)
            )
        )
        .returning()

    return c.json(
        successResponse(
            'Role updated successfully',
            updatedRole,
        ),
        { status: 200 }
    )
})


/**
 * --------------------------------------------------------------------------------------
 * DELETE SINGLE ROLE UNDER STORE 
 * --------------------------------------------------------------------------------------
 */

// storeRoleRoutes.delete('/:roleId', hasPermissionMiddleware(PERMISSION_MAP.delete.roles), async (c) => {
//     const storeMember = c.get('storeMember')
//     const roleId = c.req.param('roleId')
//     if (!roleId) return c.json(
//         failureResponse(
//             'Missing role id!',
//             'MISSING_ID'
//         ),
//         { status: 400 }
//     )


//     const existRole = await db.query.storeRolesTable.findFirst({
//         where(storeRoleTable, { and, eq }) {
//             return and(
//                 eq(storeRoleTable.id, roleId),
//                 eq(storeRoleTable.storeId, storeMember.storeId),
//             )
//         },
//     })

//     if (!existRole) throw new AppError(
//         'Role not found',
//         404,
//         'NOT_FOUND'
//     )

//     if (existRole.name.toLowerCase() === 'owner') throw new AppError('Owner role can not delete', 400, 'BAD_REQUEST')

//     const updatedRole = await db.delete(storeRolesTable)
//         .where(
//             and(
//                 eq(storeRolesTable.id, existRole.id),
//                 eq(storeRolesTable.storeId, storeMember.storeId)
//             )
//         )
//         .returning()

//     return c.json(
//         successResponse(
//             'Role updated successfully',
//             updatedRole,
//         ),
//         { status: 200 }
//     )
// })

export default storeRoleRoutes