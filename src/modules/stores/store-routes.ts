import { Hono } from "hono";
import { storeCreateSchema } from "./store-create-schema.js";
import { AppError } from "@/libs/app-error.js";
import { db } from "@/drizzle/db.js";
import { generateSlug } from "@/libs/utils.js";
import { storesTable } from "@/drizzle/schema/stores-table.js";
import { storeMembersTable } from "@/drizzle/schema/store-members-table.js";
import { storeRolesTable } from "@/drizzle/schema/store-role-table.js";
import { storeRolePermissionsTable } from "@/drizzle/schema/store-role-permission-table.js";
import { DEFAULT_STAFF_PERMISSIONS } from "./store-constants.js";
import { successResponse } from "@/libs/api-response.js";
import storeMemberRoutes from "./store-members/store-members-routes.js";
import storeRoleRoutes from "./store-roles/store-roles-routes.js";
import storeCategoryRoute from "./store-categories/store-categories-routes.js";
import storeUnitsRoute from "./store-units/store-units-routes.js";
import storeSuppliersRoute from "./store-suppliers/store-suppliers-routes.js";
import storeCustomersRoute from "./store-customers/store-customers-routes.js";
import storeProductsRoute from "./store-products/store-products-routes.js";

const storeRoutes = new Hono()

storeRoutes.route('/:storeId/members', storeMemberRoutes)
storeRoutes.route('/:storeId/roles', storeRoleRoutes)
storeRoutes.route('/:storeId/categories', storeCategoryRoute)
storeRoutes.route('/:storeId/units', storeUnitsRoute)
storeRoutes.route('/:storeId/suppliers', storeSuppliersRoute)
storeRoutes.route('/:storeId/customers', storeCustomersRoute)
storeRoutes.route('/:storeId/products', storeProductsRoute)

storeRoutes.post('/', async (c) => {
    const authUser = c.get('authUser')
    const body = await c.req.json()
    const validation = storeCreateSchema.safeParse(body)
    if (!validation.success) throw new AppError('Invalid Request Body', 400, 'INVALID_REQUEST_BODY', validation.error)
    const { name, address, phone } = validation.data
    const slug = generateSlug(name)

    const existStore = await db.query.storesTable.findFirst({
        where(storesTable, { eq, or, and }) {
            return or(
                eq(storesTable.slug, slug),
                phone ? eq(storesTable.phone, phone) : undefined
            )
        }
    })


    if (existStore) throw new AppError('Store already exist', 400, 'ALREADY_EXIST')

    const result = await db.transaction(
        async (tx) => {
            const [newStore] = await tx.insert(storesTable).values({
                name,
                slug,
                address,
                phone,
            }).returning()

            if (!newStore) throw new Error('Failed to create store')

            const [newStoreOwnerRole] = await tx.insert(storeRolesTable).values({
                name: 'OWNER',
                storeId: newStore.id,
                isSystem: true,
            }).returning()
            if (!newStoreOwnerRole) throw new Error('Failed to create owner role')

            const [newStoreStaffRole] = await tx.insert(storeRolesTable).values({
                name: 'STAFF',
                storeId: newStore.id,
                isSystem: true,
            }).returning()
            if (!newStoreStaffRole) throw new Error('Failed to create staff role')

            const [newStoreOwnerMember] = await tx.insert(storeMembersTable).values({
                storeId: newStore.id,
                userId: authUser.sub,
                roleId: newStoreOwnerRole.id,
            }).returning()

            if (!newStoreOwnerMember) throw new Error('Failed to create store owner')

            const storePermissions = await tx.query.storePermissionsTable.findMany({
                columns: {
                    id: true,
                    resource: true,
                    action: true
                }
            })

            const storePermissionLen = storePermissions.length

            if (storePermissionLen > 0) {
                await tx.insert(storeRolePermissionsTable).values(
                    storePermissions.map(({ id }) => (
                        { permissionId: id, roleId: newStoreOwnerRole.id }
                    ))
                )
            }

            const staffPermissionIds = storePermissions.filter(permission => {
                return DEFAULT_STAFF_PERMISSIONS.some(staffPermission => (
                    (staffPermission.action === permission.action &&
                        staffPermission.resource === permission.resource)
                ))
            }).map(p => p.id)

            if (staffPermissionIds.length > 0) {
                await tx.insert(storeRolePermissionsTable).values(
                    staffPermissionIds.map(id => (
                        { permissionId: id, roleId: newStoreStaffRole.id }
                    ))
                )
            }
            return {
                owner: newStoreOwnerMember,
                store: newStore,
                storeRole: newStoreOwnerRole
            }
        }
    )

    return c.json(
        successResponse('Store created successfully!', result),
        { status: 201 }
    )

})


storeRoutes.get('/', async (c) => {
    const authUser = c.get('authUser')

    const existStore = await db.query.storesTable.findMany()

    return c.json(
        successResponse('Store created successfully!', existStore),
        { status: 201 }
    )

})



export default storeRoutes