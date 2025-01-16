// index.js
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js"; // Adjusted to the correct path if needed
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { hashPassword, checkPassword, generateJWT, verifyJWT } from './routes/auth.js';
import taskRouter from "./routes/tasks.js"; // Adjusted to the correct path if needed
dotenv.config();

//const JWT_SECRET = process.env.JWT_SECRET;
//let jwt_token =  jwt.sign(payload, JWT_SECRET); // koristimo enkripcijski ključ iz varijableokruženja
//console.log(jwt_token);

const PORT = 8000;

const app = express();
app.use(cors());
app.use(express.json());

// Route middlewares
app.use("/auth", authRouter);
app.use("/tasks", taskRouter);

app.get("/", (req, res) => {
  res.send("TaskManagerBackend");
});

app.listen(PORT, () => {
  console.log(`Poslužitelj sluša na portu ${PORT}`);
});
