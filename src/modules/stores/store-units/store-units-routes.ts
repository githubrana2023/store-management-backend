import { storeMemberMiddleware } from "@/middleware/store-member-middleware.js";
import { Hono } from "hono";

const storeUnitsRoute = new Hono()
storeUnitsRoute.use('*', storeMemberMiddleware)

export default storeUnitsRoute