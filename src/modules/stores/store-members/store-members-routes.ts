import { db } from "@/drizzle/db.js";
import { storeMembersTable } from "@/drizzle/schema/store-members-table.js";
import { AppError } from "@/libs/app-error.js";
import { hasPermissionMiddleware } from "@/middleware/has-permission-middleware.js";
import { storeMemberMiddleware } from "@/middleware/store-member-middleware.js";
import { Hono } from "hono";
import { storeMemberCreateSchema } from "./store-member-create-schema.js";
import { successResponse } from "@/libs/api-response.js";
import { and, eq } from "drizzle-orm";
import { storeMemberUpdateSchema } from "./store-member-update-schema.js";
import { storeRolesTable } from "@/drizzle/schema/store-role-table.js";

const storeMemberRoutes = new Hono()

storeMemberRoutes.use('*', storeMemberMiddleware)


storeMemberRoutes.get('/', hasPermissionMiddleware('members', 'view'), async (c) => {
    return c.json({ msg: 'nested members routes' }, { status: 200 })
})

storeMemberRoutes.get('/:memberId', hasPermissionMiddleware('members', 'view'), async (c) => {
    return c.json({ msg: 'nested members routes' }, { status: 200 })
})

storeMemberRoutes.post('/', hasPermissionMiddleware('members', 'create'), async (c) => {
    const body = await c.req.json()
    const storeMember = c.get('storeMember')
    const validation = storeMemberCreateSchema.safeParse(body)
    if (!validation.success) throw new AppError('Invalid Fields', 400, 'INVALID_FIELD')
    const { phoneOrEmail, roleId } = validation.data

    //! check the user exist or not that u want to give membership
    const existUser = await db.query.usersTable.findFirst({
        where(table, { eq, or }) {
            return or(
                eq(table.phone, phoneOrEmail),
                eq(table.email, phoneOrEmail),
            )
        }
    })
    if (!existUser) throw new AppError(
        'User not found for membership', 404, 'NOT_FOUND'
    )

    //! checking that the user already has membership to under the same store
    const existStoreMembership = await db.query.storeMembersTable.findFirst({
        where(table, { eq, and, or }) {
            return and(
                eq(table.storeId, storeMember.storeId),
                eq(table.userId, existUser.id),
            )
        }
    })
    if (existStoreMembership) throw new AppError(`User "${existUser.name}" already has membership`, 400, 'ALREADY_EXIST')

    //! store membership role checking is that role exist or not
    const existStoreRole = await db.query.storeRolesTable.findFirst({
        where(storeRoleTable, operators) {
            return operators.and(
                operators.eq(storeRoleTable.id, roleId),
                operators.eq(storeRoleTable.storeId, storeMember.storeId),
            )
        },
    })
    if (!existStoreRole) throw new AppError(
        "Role not found", 404, 'NOT_FOUND'
    )

    if (existStoreRole.name.toLowerCase() === 'owner') throw new AppError('Store owner can not be more than one', 400, 'BAD_REQUEST')

    const [newMember] = await db.insert(storeMembersTable).values({
        roleId: existStoreRole.id,
        storeId: storeMember.storeId,
        userId: existUser.id
    }).returning()

    return c.json(
        successResponse('Membership created!', newMember)
        , { status: 200 })
})


storeMemberRoutes.patch('/:memberId', hasPermissionMiddleware('members', 'update'), async (c) => {
    const body = await c.req.json()
    const validation = storeMemberUpdateSchema.safeParse(body)
    if (!validation.success) throw validation.error
    const { roleId } = validation.data

    const storeMember = c.get('storeMember')
    const memberId = c.req.param('memberId')
    if (!memberId) throw new AppError('Missing member id', 400, 'MISSING_MEMBER_ID')

    const existMembership = await db.query.storeMembersTable.findFirst({
        where: (storeMemberTable, { and, eq }) => and(
            eq(storeMemberTable.id, memberId),
            eq(storeMemberTable.storeId, storeMember.storeId)
        ),
        with: {
            role: {
                columns: {
                    name: true
                }
            }
        }
    })

    if (!existMembership) throw new AppError(`Member not belongs to current store`, 404, 'NOT_FOUND')

    if (existMembership.role.name.toLowerCase() === 'owner') throw new AppError('Owner role can not be changed!', 400, 'BAD_REQUEST')

    let storeRole: typeof storeRolesTable.$inferSelect | undefined = undefined
    if (roleId) {
        const existCurrentStoreRole = await db.query.storeRolesTable.findFirst({
            where: (storeRoleTable, { eq, and }) => and(
                eq(storeRoleTable.id, roleId),
                eq(storeRoleTable.storeId, storeMember.storeId),
            )
        })

        if (!existCurrentStoreRole) throw new AppError(`Store role not found`, 404, 'NOT_FOUND')
        if (
            existCurrentStoreRole.name.toLowerCase() === 'owner' &&
            existCurrentStoreRole.isSystem
        ) throw new AppError(`Store owner can't be changed`, 400, 'BAD_REQUEST')
        storeRole = existCurrentStoreRole
    }

    const [updateMemberRole] = await db.update(storeMembersTable).set({
        roleId: storeRole?.id,
    })
        .where(
            and(
                eq(storeMembersTable.id, existMembership.id),
                eq(storeMembersTable.userId, existMembership.userId),
            )
        )
        .returning()
    return c.json(
        successResponse('Member updated', updateMemberRole)
    )
})

storeMemberRoutes.delete('/:memberId', hasPermissionMiddleware('members', 'delete'), async (c) => {
    const storeMember = c.get('storeMember')
    const memberId = c.req.param('memberId')
    if (!memberId) throw new AppError('Missing member id', 400, 'MISSING_MEMBER_ID')

    const memberShip = await db.query.storeMembersTable.findFirst({
        where(storeMembers, { and, eq }) {
            return and(
                eq(storeMembers.id, memberId),
                eq(storeMembers.storeId, storeMember.storeId),
            )
        },
        with: {
            role: {
                columns: {
                    name: true
                }
            }
        }
    })

    if (!memberShip) throw new AppError(
        'Membership not found!', 404, 'NOT_FOUND'
    )

    if (memberShip.role.name.toLowerCase() === 'owner') throw new AppError('Owner can not deleted!', 400, 'BAD_REQUEST')

    const [deletedMember] = await db.delete(storeMembersTable).where(
        and(
            eq(storeMembersTable.id, memberShip.id),
            eq(storeMembersTable.storeId, memberShip.storeId),
        )
    ).returning()

    return c.json(
        successResponse("Membership deleted successfully", deletedMember), { status: 200 })
})




export default storeMemberRoutes