import { db } from "@/drizzle/db.js";
import { AppError } from "@/libs/app-error.js";
import { createMiddleware } from "hono/factory";

export const storeMemberMiddleware = createMiddleware(
    async (c, next) => {
        const authUser = c.get('authUser')
        const storeId = c.req.param('storeId')
        if (!storeId) throw new AppError('Missing store id', 400, 'MISSING_STORE_ID')
        if (!authUser) throw new AppError('Unauthenticated!', 401, 'UNAUTHENTICATED')

        const store = await db.query.storesTable.findFirst({
            where(storeTable, { eq }) {
                return eq(
                    storeTable.id, storeId
                )
            }
        })

        if (!store) throw new AppError('Store not found!', 404, 'NOT_FOUND')

        const storeMember = await db.query.storeMembersTable.findFirst({
            where(storeMemberTable, { and, eq }) {
                return and(
                    eq(storeMemberTable.storeId, store.id),
                    eq(storeMemberTable.userId, authUser.sub)
                )
            },
        })

        if (!storeMember) throw new AppError('You are not a member of that store', 403, 'FORBIDDEN_ACCESS')
        if (storeMember.status !== 'ACTIVE') throw new AppError(`Your membership is now ${storeMember.status}`, 400, 'INACTIVE_MEMBERSHIP')

        c.set('storeMember', {
            id: storeMember.id,
            userId: storeMember.userId,
            storeId: storeMember.storeId,
            roleId: storeMember.roleId,
            status: storeMember.status,
        })

        await next()
    }
)