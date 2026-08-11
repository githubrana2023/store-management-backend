import { successResponse } from "@/libs/api-response.js";
import { platformAuthorizedMiddleware } from "@/middleware/authorized-middleware.js";
import { Hono } from "hono";

const platformAdminRoutes = new Hono()
platformAdminRoutes.use('*', platformAuthorizedMiddleware)

platformAdminRoutes.get('/', async (c) => {
    return c.json(
        successResponse('admin route test', {
            admin: 'true'
        })
    )
})

export default platformAdminRoutes