import { storeMemberMiddleware } from "@/middleware/store-member-middleware.js";
import { Hono } from "hono";

const storeProductsRoute = new Hono()
storeProductsRoute.use('*', storeMemberMiddleware)

export default storeProductsRoute