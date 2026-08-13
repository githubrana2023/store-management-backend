import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import routes from './routes/index.js'
import platformAdminRoutes from './routes/platform-admin-routes.js'
import { globalErrorHandler } from './middleware/global-error-middleware.js'
import { authRequired } from './middleware/auth-middleware.js'
import { logger } from 'hono/logger'
import { platformAuthorizedMiddleware } from './middleware/authorized-middleware.js'
import { db } from './drizzle/db.js'

const app = new Hono()

// MIDDLEWARES
app.use(logger())
app.onError(globalErrorHandler)
app.use('*', authRequired)

//normal users routes
app.route('/api', routes)
//platform admin routes
app.route('/admin', platformAdminRoutes)

app.get('/api/users', async(c) => {
const users = await db.query.usersTable.findMany()
  return c.json(users)
})

app.get('/', (c) => {
  
  return c.text('Hello Hono!')
})


export default app