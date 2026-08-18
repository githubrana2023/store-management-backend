import type { PermissionMap } from "@/types/permission-type.js";

export const PERMISSION_SPLITTER = "." as const
export const PERMISSION_MAP: PermissionMap = {
    create: {
        categories: 'categories.create',
        customers: 'customers.create',
        members: 'members.create',
        products: 'products.create',
        roles: 'roles.create',
        suppliers: 'suppliers.create',
        units: 'units.create'
    },
    view: {
        categories: 'categories.view',
        customers: 'customers.view',
        members: 'members.view',
        products: 'products.view',
        roles: 'roles.view',
        suppliers: 'suppliers.view',
        units: 'units.view'
    },
    update: {
        categories: 'categories.update',
        customers: 'customers.update',
        members: 'members.update',
        products: 'products.update',
        roles: 'roles.update',
        suppliers: 'suppliers.update',
        units: 'units.update'
    },
    delete: {
        categories: 'categories.delete',
        customers: 'customers.delete',
        members: 'members.delete',
        products: 'products.delete',
        roles: 'roles.delete',
        suppliers: 'suppliers.delete',
        units: 'units.delete'
    },
}