import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.js";
import reservationRouter from "./routes/reservationRoute.js";
import { dbConnection } from "./database/dbConnection.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.js";
import path from "path"

const app = express();
const _dirname = path.resolve();
dotenv.config({ path: "./config.env" });

app.use(
  cors({
    origin: ["https://mern-internship-group-73-1.onrender.com/"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);


app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", userRoutes);  // << This is key!
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/reservation", reservationRouter);
app.get("https://mern-internship-group-73-1.onrender.com/", (req, res, next)=>{return res.status(200).json({
  success: true,
  message: "HELLO WORLD AGAIN"
})})

app.use(express.static(path.join(_dirname , "/frontend/dist")))
app.get('*' , (req , res) => {
  res.sendFile(path.resolve(_dirname , "frontend" , "dist" , "index.html"));
});

dbConnection();

app.use(errorMiddleware);
app.listen(process.env.PORT, ()=>{
  console.log(`SERVER HAS STARTED AT PORT ${process.env.PORT || 4000}`);
})


export default app;
