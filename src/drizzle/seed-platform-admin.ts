import bcrypt from "bcryptjs"
import { db } from "./db.js"
import { usersTable } from "./schema/users-tables.js"
import { config } from "@/config/evn.js"


export const seedDatabase = async () => {
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