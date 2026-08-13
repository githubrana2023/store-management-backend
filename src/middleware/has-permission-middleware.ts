import { db } from "@/drizzle/db.js";
import { AppError } from "@/libs/app-error.js";
import { createMiddleware } from "hono/factory";

export const hasPermissionMiddleware = (resource: string, action: string) => createMiddleware(
    async (c, next) => {
        const authUser = c.get('authUser')
        const storeId = c.req.param('storeId')
        const storeMember = c.get('storeMember')

        if (authUser.platformRole === 'ADMIN') {
            return await next()
        }

        if (!storeId) throw new AppError('Missing store id', 400, 'MISSING_STORE_ID')
        if (!authUser) throw new AppError('Unauthenticated!', 401, 'UNAUTHENTICATED')

        if (!storeMember) {
            throw new AppError(
                'Store membership information is missing',
                500,
                'STORE_MEMBER_CONTEXT_MISSING'
            )

        }
        const storeRole = await db.query.storeRolesTable.findFirst({
            where(table, { eq, and }) {
                return and(
                    eq(table.storeId, storeMember.storeId),
                    eq(table.id, storeMember.roleId)
                )
            }
        })

        if (!storeRole) throw new AppError(`Store role not found`, 404, 'NOT_FOUND')

        const permission = await db.query.storePermissionsTable.findFirst({
            where(table, { and, eq }) {
                return and(
                    eq(table.resource, resource),
                    eq(table.action, action),
                )
            }
        })

        if (!permission) throw new AppError(`Permission not found by resource: ${resource} & action: ${action}`, 404, 'NOT_FOUND')

        const storePermission = await db.query.storeRolePermissionsTable.findFirst(
            {
                where(storeRolePermissionsTable, { eq, and }) {
                    return and(
                        eq(storeRolePermissionsTable.roleId, storeRole.id),
                        eq(storeRolePermissionsTable.permissionId, permission.id),
                    )
                }
            }
        )

        if (!storePermission) throw new AppError(`you're not allow to perform ${action} ${resource} action`, 403, 'FORBIDDEN_ACCESS')

        return await next()
    }
)