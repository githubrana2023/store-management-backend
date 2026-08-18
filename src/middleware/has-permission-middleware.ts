import { PERMISSION_SPLITTER } from "@/constants/persmission.js";
import { db } from "@/drizzle/db.js";
import { AppError } from "@/libs/app-error.js";
import type { PermissionValue } from "@/types/permission-type.js";
import { createMiddleware } from "hono/factory";

/**
 * Checks whether the authenticated user has permission to perform
 * a specific action on a resource within the current store.
 *
 * This middleware expects `authRequired` and `storeMemberMiddleware`
 * to have already executed.
 *
 * @param resource - The store resource being accessed (e.g. "products", "sales", "inventory")
 * @param action - The action being performed (e.g. "create", "view", "update", "delete")
 *
 * @throws {AppError} 401 if the user is not authenticated.
 * @throws {AppError} 400 if the store ID is missing.
 * @throws {AppError} 500 if store member context is missing.
 * @throws {AppError} 404 if the store role or permission does not exist.
 * @throws {AppError} 403 if the user's role does not have the required permission.
 *
 * @returns Middleware that calls `next()` when the user is authorized.
 */
export const hasPermissionMiddleware = (permissionValue: PermissionValue) => createMiddleware(
    async (c, next) => {
        const authUser = c.get('authUser')
        const storeId = c.req.param('storeId')
        const storeMember = c.get('storeMember')

        const [resource, action] = permissionValue.split(PERMISSION_SPLITTER)

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

        if (!storePermission) throw new AppError(`you're not allow to perform "${action} ${resource}" action`, 403, 'FORBIDDEN_ACCESS')

        return await next()
    }
)