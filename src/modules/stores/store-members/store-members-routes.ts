import { hasPermissionMiddleware } from "@/middleware/has-permission-middleware.js";
import { storeMemberMiddleware } from "@/middleware/store-member-middleware.js";
import { Hono } from "hono";

const storeMemberRoutes = new Hono()

storeMemberRoutes.use('*', storeMemberMiddleware)

storeMemberRoutes.get('/', hasPermissionMiddleware('members', 'view'), async (c) => {
    return c.json({ msg: 'nested members routes' }, { status: 200 })
})

export default storeMemberRoutes