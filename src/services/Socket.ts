import { Calculation } from "./../models/Calculation";
import { Server } from "socket.io";
import { CalculationModel } from "../models/Calculation";
import { ObjectId } from "mongoose";

export class SocketServer {
  io: Server;
  connectedSockets: { [key: string]: string } = {};

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: ["http://127.0.0.1:3001", "http://localhost:3001"],
        methods: ["GET", "POST", "DELETE", "OPTION", "PATCH"],
      },
    });

    this.io.on("connection", (socket) => {
      socket.emit("connected", {
        id: socket.id,
        message: "connected with server",
      });

      socket.on("register", (data: { userId: string }) => {
        if (this.connectedSockets[data.userId]) {
          socket.disconnect(true);
        }

        this.connectedSockets = { [data.userId]: socket.id };
      });

      socket.on("disconnect", () => {
        console.log("disconneced: ", socket.id);
      });

      socket.on("reorder", async (data: { id: ObjectId; index: number }[]) => {
        try {
          await CalculationModel.updateOne(
            { _id: data[0].id },
            { $set: { index: data[0].index } }
          );
          await CalculationModel.updateOne(
            { _id: data[1].id },
            { $set: { index: data[1].index } }
          );

          this.io.emit("reordered", {
            [data[0].id.toString()]: data[0].index,
            [data[1].id.toString()]: data[1].index,
          });
        } catch (error) {
          throw error;
        }
      });
    });
  }
}
