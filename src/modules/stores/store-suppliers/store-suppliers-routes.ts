import { storeMemberMiddleware } from "@/middleware/store-member-middleware.js";
import { Hono } from "hono";

const storeSuppliersRoute = new Hono()
storeSuppliersRoute.use('*', storeMemberMiddleware)

export default storeSuppliersRoute