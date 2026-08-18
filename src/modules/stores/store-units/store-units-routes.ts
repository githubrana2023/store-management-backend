import { hasPermissionMiddleware } from "@/middleware/has-permission-middleware.js";
import { storeMemberMiddleware } from "@/middleware/store-member-middleware.js";
import { Hono } from "hono";
import { storeUnitCreateSchema } from "./store-unit-create-schema.js";
import { db } from "@/drizzle/db.js";
import { AppError } from "@/libs/app-error.js";
import { storeUnitsTable } from "@/drizzle/schema/store-unit-table.js";
import { successResponse } from "@/libs/api-response.js";
import { PERMISSION_MAP } from "@/constants/persmission.js";
import { storeUnitUpdateSchema } from "./store-unit-update-schema.js";
import { and, eq } from "drizzle-orm";

const storeUnitsRoute = new Hono()
storeUnitsRoute.use('*', storeMemberMiddleware)

/**
 * ----------------------------------------------------------------------------
 *  GET UNIT
 * ----------------------------------------------------------------------------
 */

storeUnitsRoute.get('/', hasPermissionMiddleware(PERMISSION_MAP.view.units), async (c) => {
    const storeMember = c.get('storeMember')
    const query = c.req.query() //TODO

    const units = await db.query.storeUnitsTable.findMany({
        where: (unitTable, { and, or, eq }) => and(
            eq(unitTable.storeId, storeMember.storeId),
            eq(unitTable.isDeleted, false),
        )
    })

    return c.json(
        successResponse('Store units retrieved successfully', units),
        { status: 200 }
    )
})

/**
 * ----------------------------------------------------------------------------
 *  GET SINGLE UNIT
 * ----------------------------------------------------------------------------
 */

storeUnitsRoute.get('/:unitId', hasPermissionMiddleware(PERMISSION_MAP.view.units), async (c) => {
    const storeMember = c.get('storeMember')
    const unitId = c.req.param('unitId')
    if (!unitId) throw new AppError('Unit id is missing', 400, 'BAD_REQUEST')

    const unit = await db.query.storeUnitsTable.findFirst({
        where: (unitTable, { and, eq }) => and(
            eq(unitTable.storeId, storeMember.storeId),
            eq(unitTable.id, unitId),
        )
    })

    if (!unit) throw new AppError('Store unit not found', 404, 'NOT_FOUND')
    if (unit.isDeleted) throw new AppError('Store unit already deleted', 404, 'NOT_FOUND')

    return c.json(
        successResponse('Store unit retrieved successfully', unit),
        { status: 200 }
    )
})




/**
 * ----------------------------------------------------------------------------
 *  CREATE UNIT
 * ----------------------------------------------------------------------------
 */

storeUnitsRoute.post('/', hasPermissionMiddleware(PERMISSION_MAP.create.units), async (c) => {
    const storeMember = c.get('storeMember')

    // body validation
    const body = await c.req.json()
    const { data, error, success } = storeUnitCreateSchema.safeParse(body)
    if (!success) throw error
    const { name, shortName } = data

    const existUnit = await db.query.storeUnitsTable.findFirst({
        where: (storeUnitTable, { and, eq, or }) => and(
            or(
                eq(storeUnitTable.name, name),
                eq(storeUnitTable.shortName, shortName)
            ),
            eq(storeUnitTable.storeId, storeMember.storeId)
        )
    })

    if (existUnit) throw new AppError(`Unit already exist with '${name} or {shortName}`, 400, 'ALREADY_EXIST')

    const [newUnit] = await db.insert(storeUnitsTable).values({
        name,
        shortName,
        storeId: storeMember.storeId
    }).returning()
    return c.json(
        successResponse(
            'Store unit created successfully', newUnit
        ),
        { status: 201 }
    )
})



/**
 * ----------------------------------------------------------------------------
 *  UPDATE SINGLE UNIT
 * ----------------------------------------------------------------------------
 */

storeUnitsRoute.patch('/:unitId', hasPermissionMiddleware(PERMISSION_MAP.update.units), async (c) => {
    const storeMember = c.get('storeMember')
    const body = await c.req.json()
    const { data, error, success } = storeUnitUpdateSchema.safeParse(body)
    if (!success) throw error
    const { name, shortName } = data


    const unitId = c.req.param('unitId')
    if (!unitId) throw new AppError('Unit id is missing', 400, 'BAD_REQUEST')


    const unit = await db.query.storeUnitsTable.findFirst({
        where: (unitTable, { and, eq }) => and(
            eq(unitTable.storeId, storeMember.storeId),
            eq(unitTable.id, unitId),
        )
    })


    if (!unit) throw new AppError('Store unit not found', 404, 'NOT_FOUND')
    if (unit.isDeleted) throw new AppError('Store unit already deleted', 404, 'NOT_FOUND')

    if (name) {
        const existUnit = await db.query.storeUnitsTable.findFirst({
            where: (storeUnitTable, { and, eq, }) => and(
                eq(storeUnitTable.name, name),
                eq(storeUnitTable.storeId, storeMember.storeId)
            )
        })

        if (existUnit) throw new AppError(`Store unit already exist with 'name ${name}'`, 400, 'ALREADY_EXIST')
    }

    if (shortName) {
        const existUnit = await db.query.storeUnitsTable.findFirst({
            where: (storeUnitTable, { and, eq, }) => and(
                eq(storeUnitTable.shortName, shortName),
                eq(storeUnitTable.storeId, storeMember.storeId)
            )
        })

        if (existUnit) throw new AppError(`Store unit already exist with 'short name ${shortName}'`, 400, 'ALREADY_EXIST')
    }

    const [updatedUnit] = await db.update(storeUnitsTable).set({
        name,
        shortName
    })
        .where(
            and(
                eq(storeUnitsTable.id, unit.id),
                eq(storeUnitsTable.storeId, storeMember.id)
            )
        )
        .returning()



    return c.json(
        successResponse('Store unit retrieved successfully', updatedUnit),
        { status: 200 }
    )
})


/**
 * ----------------------------------------------------------------------------
 *  DELETE SINGLE UNIT
 * ----------------------------------------------------------------------------
 */

storeUnitsRoute.delete('/:unitId', hasPermissionMiddleware(PERMISSION_MAP.delete.units), async (c) => {
    const storeMember = c.get('storeMember')

    const unitId = c.req.param('unitId')
    if (!unitId) throw new AppError('Unit id is missing', 400, 'BAD_REQUEST')


    const unit = await db.query.storeUnitsTable.findFirst({
        where: (unitTable, { and, eq }) => and(
            eq(unitTable.storeId, storeMember.storeId),
            eq(unitTable.id, unitId),
        )
    })


    if (!unit) throw new AppError('Store unit not found', 404, 'NOT_FOUND')
    if (unit.isDeleted) throw new AppError('Store unit already deleted', 404, 'NOT_FOUND')

    const [updatedUnit] = await db.update(storeUnitsTable).set({
        isDeleted: true
    })
        .where(
            and(
                eq(storeUnitsTable.id, unit.id),
                eq(storeUnitsTable.storeId, storeMember.id)
            )
        )
        .returning()



    return c.json(
        successResponse('Store unit retrieved successfully', updatedUnit),
        { status: 200 }
    )
})


export default storeUnitsRoute