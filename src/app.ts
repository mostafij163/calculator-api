import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { container } from "tsyringe";
import { Server } from "socket.io";
import { CalculationController } from "./controllers/Calculation";

dotenv.config({
  path: "./development.env",
});
import "./config/db";
import { SocketServer } from "./services/Socket";
const port: number = Number(process.env.PORT) || 5000;

const app: Application = express();
app.use(cors());
app.use(express.json());

app.use("/calculation", container.resolve(CalculationController).routes());
const server = app.listen(port, () => {
  console.log(`app running on port: ${port}`);
});

export const socketServer = new SocketServer(server);
