import authRoutes from "@/modules/auth/auth-routes.js";
import { Hono } from "hono";

const routes = new Hono()

routes.route('/auth', authRoutes)


export default routes