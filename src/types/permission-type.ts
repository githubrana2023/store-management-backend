import type { PERMISSION_SPLITTER } from "@/constants/persmission.js"

type Action = 'create' | 'view' | 'update' | 'delete'
type Resource = 'members' | 'roles' | 'categories' | 'customers' | 'products' | 'suppliers' | 'units'

export type PermissionMap = {
    [A in Action]: {
        [R in Resource]: `${R}${typeof PERMISSION_SPLITTER}${A}`
    }
}

export type PermissionValue = PermissionMap[Action][Resource]