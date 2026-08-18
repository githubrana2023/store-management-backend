import { db } from "@/drizzle/db.js";
import { successResponse } from "@/libs/api-response.js";
import { hasPermissionMiddleware } from "@/middleware/has-permission-middleware.js";
import { storeMemberMiddleware } from "@/middleware/store-member-middleware.js";
import { Hono } from "hono";
import { storeCategoryCreateSchema } from "./store-categories-create-schema.js";
import { storeCategoriesTable } from "@/drizzle/schema/store-category-table.js";
import { AppError } from "@/libs/app-error.js";
import { storeCategoryUpdateSchema } from "./store-categories-update-schema.js";
import { and, eq } from "drizzle-orm";
import { PERMISSION_MAP } from "@/constants/persmission.js";

const storeCategoryRoute = new Hono()

storeCategoryRoute.use('*', storeMemberMiddleware)

storeCategoryRoute.get('/', hasPermissionMiddleware(PERMISSION_MAP.view.categories), async (c) => {
    const storeMember = c.get('storeMember')
    const categories = await db.query.storeCategoriesTable.findMany({
        where(storeCategoriesTable, { and, eq }) {
            return and(
                eq(storeCategoriesTable.storeId, storeMember.storeId)
            )

        },
    })

    return c.json(
        successResponse(
            'Store categories retrieved', categories
        ),
        { status: 200 }
    )
})

storeCategoryRoute.post('/', hasPermissionMiddleware(PERMISSION_MAP.create.categories), async (c) => {
    const storeMember = c.get('storeMember')
    const body = await c.req.json()
    const validation = storeCategoryCreateSchema.safeParse(body)
    if (!validation.success) throw new AppError('Invalid Field', 400, 'INVALID_FIELD')
    const { name, description } = validation.data

    const existCategory = await db.query.storeCategoriesTable.findFirst({
        where(storeCategoryTable, { eq, and }) {
            return and(
                eq(storeCategoryTable.name, name),
                eq(storeCategoryTable.storeId, storeMember.storeId),
            )
        }
    })

    if (existCategory) throw new AppError(
        'Store category already Exist',
        400,
        'ALREADY_EXIST'
    );

    const [newCategory] = await db.insert(storeCategoriesTable).values({
        name,
        description,
        storeId: storeMember.storeId
    }).returning()


    return c.json(
        successResponse('Store category created!', newCategory),
        { status: 201 }
    )
})

storeCategoryRoute.patch('/:categoryId', hasPermissionMiddleware(PERMISSION_MAP.update.categories), async (c) => {
    const storeMember = c.get('storeMember')
    const categoryId = c.req.param('categoryId')
    if (!categoryId) throw new AppError('Missing category Id', 400, 'MISSING_CATEGORY_ID')

    const body = await c.req.json()
    const validation = storeCategoryUpdateSchema.safeParse(body)
    if (!validation.success) throw new AppError('Invalid Field', 400, 'INVALID_FIELD')
    const { name: newUpdateName, description } = validation.data

    const existCategory = await db.query.storeCategoriesTable.findFirst({
        where(storeCategoryTable, { eq, and }) {
            return and(
                eq(storeCategoryTable.id, categoryId),
                eq(storeCategoryTable.storeId, storeMember.storeId),
            )
        }
    })

    if (!existCategory) throw new AppError(
        `Store category not found`,
        404,
        'NOT_FOUND'
    );

    if (existCategory.isDeleted) throw new AppError('Category is deleted can not update', 400, 'CATEGORY_IS_DELETED')


    if (newUpdateName) {
        const existCategory = await db.query.storeCategoriesTable.findFirst({
            where(storeCategoryTable, { eq, and }) {
                return and(
                    eq(storeCategoryTable.name, newUpdateName),
                    eq(storeCategoryTable.storeId, storeMember.storeId),
                )
            }
        })

        if (existCategory) throw new AppError(
            `Store category already exist with same name ${newUpdateName}`,
            400,
            'ALREADY_EXIST'
        );
    }

    const [newUpdatedCategory] = await db.update(storeCategoriesTable).set({
        name: newUpdateName,
        description,
    })
        .where(
            and(
                eq(storeCategoriesTable.id, existCategory.id),
                eq(storeCategoriesTable.storeId, existCategory.storeId)
            )
        )
        .returning()


    return c.json(
        successResponse('Store category created!', newUpdatedCategory),
        { status: 201 }
    )
})

storeCategoryRoute.delete('/:categoryId', hasPermissionMiddleware(PERMISSION_MAP.delete.categories), async (c) => {
    const storeMember = c.get('storeMember')
    const categoryId = c.req.param('categoryId')
    if (!categoryId) throw new AppError('Missing category Id', 400, 'MISSING_CATEGORY_ID')


    const existCategory = await db.query.storeCategoriesTable.findFirst({
        where(storeCategoryTable, { eq, and }) {
            return and(
                eq(storeCategoryTable.id, categoryId),
                eq(storeCategoryTable.storeId, storeMember.storeId),
            )
        }
    })

    if (!existCategory) throw new AppError(
        `Store category not found`,
        404,
        'NOT_FOUND'
    );


    const [newSoftDeletedCategory] = await db.update(storeCategoriesTable).set({
        isDeleted: true
    })
        .where(
            and(
                eq(storeCategoriesTable.id, existCategory.id),
                eq(storeCategoriesTable.storeId, existCategory.storeId)
            )
        )
        .returning()


    return c.json(
        successResponse('Store category created!', newSoftDeletedCategory),
        { status: 201 }
    )
})

export default storeCategoryRoute