import express, { Express } from "express";
import dotenv from "dotenv";
import connectToDB from "./database/db";

// initialize express server
dotenv.config();
const app: Express = express();

// parse requests
app.use(express.json());

// connect to database
connectToDB();

// all routes

// start the express server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
