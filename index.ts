import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import connectDB from "./config/configDB"
import userRouter from "./routes/user.route"
import recordingRouter from "./routes/recording.route"

dotenv.config()

const app = express()
app.use(express.json({ limit: "500mb" }))
app.use(express.urlencoded({ limit: "500mb", extended: true }))
const PORT = process.env.PORT || 5000

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  credentials: true,
}
app.use(cors(corsOptions))

app.use(express.json())

app.use("/uploads", express.static("/tmp/uploads"))

app.use("/api/user", userRouter)
app.use("/api/recording", recordingRouter)

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      description: "API endpoints and models",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./routes/*.ts"],
}

const swaggerDoc = swaggerJsdoc(swaggerOptions)
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDoc))

const start = async () => {
  try {
    await connectDB(process.env.MONGODB)
    console.log("Connected successfully to the database")
    app.listen(PORT, () => {
      console.log("Server is listening on port " + PORT)
    })
  } catch (error) {
    console.log("error " + error)
  }
}

start()
