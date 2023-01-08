import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import morgan from "morgan"
import {config} from "dotenv"
import users from './routes/users.js';
import auth from './routes/auth.js'
import posts from './routes/posts.js'
import cookieParser from "cookie-parser"

config();
const app = express();
mongoose.set("strictQuery", true).connect(process.env.MONGO_URI)
.then(() => console.log("Conectado a la db"))
.catch(e => console.log("Error " + e ));

//middlewares
app.use(express.json())
app.use(cookieParser())
app.use(helmet())
app.use(morgan("common"))
//

app.use("/api/users", users)
app.use("/api/auth", auth)
app.use("/api/posts", posts)

app.listen(8000, () => console.log("Server running on http://localhost:8000") )