import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import routes from './routes/index.js'
import platformAdminRoutes from './routes/platform-admin-routes.js'

const app = new Hono()

//normal users routes
app.route('/api', routes)
//platform admin routes
app.route('/admin', platformAdminRoutes)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})


export default app