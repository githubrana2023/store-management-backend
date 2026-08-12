import authRoutes from "@/modules/auth/auth-routes.js";
import storeRoutes from "@/modules/stores/store-routes.js";
import { Hono } from "hono";

const routes = new Hono()

routes.route('/auth', authRoutes)
routes.route('/stores', storeRoutes)


export default routes