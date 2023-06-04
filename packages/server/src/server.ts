import express, { Application } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ORIGINS_ALLOWED, PORT } from './constants'
import jobsRoute from './routes/jobs.route'
import interviewsRoute from './routes/interviews.route'
import dashboardRoute from './routes/dasboard.route'

class Server {
  private app: Application

  constructor() {
    this.app = express()
    // Middlewares
    this.middlewares()
    // Routes
    this.routes()
  }

  middlewares() {
    this.app.use(
      cors({
        methods: ['GET', 'POST']
      })
    )
    this.app.use(express.json())
    this.app.use(cookieParser())
  }

  routes() {
    this.app.use('/api', jobsRoute)
    this.app.use('/api', interviewsRoute)
    this.app.use('/api', dashboardRoute)
  }

  listen() {
    this.app.listen(process.env.PORT, () => {
      console.log(`Server running at PORT: ${process.env.PORT}`)
    })
  }
}

export default Server
