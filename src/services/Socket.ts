import { Server } from "socket.io";

export class SocketServer {
  io: Server;
  connectedSockets: { [key: string]: string } = {};

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: ["http://127.0.0.1:3000", "http://localhost:3000"],
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
    });
  }
}
