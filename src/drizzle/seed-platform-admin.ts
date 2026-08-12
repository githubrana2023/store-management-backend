import bcrypt from "bcryptjs"
import { db } from "./db.js"
import { usersTable } from "./schema/users-tables.js"
import { config } from "@/config/evn.js"
import { STORE_PERMISSIONS } from "@/modules/stores/store-constants.js"
import { storePermissionsTable } from "./schema/store-permission-table.js"


const seedPermission = async () => {
    console.log('Seeding Permission...')
    for (const permission of STORE_PERMISSIONS) {
        const existPermission = await db.query.storePermissionsTable.findFirst({
            where(storePermissionTable, { and, eq }) {
                return and(
                    eq(storePermissionTable.action, permission.action),
                    eq(storePermissionTable.resource, permission.resource),
                )
            }
        })
        if (existPermission) return
        await db.insert(storePermissionsTable).values(permission)
    }
    console.log('Seeding Permission Completed...')
}

const seedSuperAdmin = async () => {
    console.log('Seeding admin...')
    const salt = await bcrypt.genSalt(10)
    const superAdminEmail = 'rtrana2023@gmail.com'
    const superAdminPhone = '01785585238'
    const superAdminName = 'RANA MIAH'
    const superAdminPassword = await bcrypt.hash(config.superAdminPassword, salt)

    const existAdmin = await db.query.usersTable.findFirst({
        where(userTable, { and, eq, or }) {

            return and(
                or(
                    eq(userTable.email, superAdminEmail),
                    eq(userTable.phone, superAdminPhone),
                ),
                eq(userTable.platformRole, 'ADMIN')
            )
        }
    })

    if (existAdmin) return console.log('Already seeded')
    await db.insert(usersTable).values({
        name: superAdminName,
        phone: superAdminPhone,
        email: superAdminEmail,
        passwordHash: superAdminPassword,
        platformRole: 'ADMIN'
    })

    console.log('Seeding admin completed')
}


export const seedDatabase = async () => {
    await seedSuperAdmin()
    await seedPermission()
}