import { storeMemberMiddleware } from "@/middleware/store-member-middleware.js";
import { Hono } from "hono";

const storeCustomersRoute = new Hono()
storeCustomersRoute.use('*', storeMemberMiddleware)

export default storeCustomersRoute