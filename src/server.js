import http from "http";
import express from "express";
import SocketIO from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (backsocket) => {
  backsocket["nickname"] = "Anon";
  backsocket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  backsocket.on("enter_room", (roomName, done) => {
    backsocket.join(roomName);
    done();
    backsocket.to(roomName).emit("welcome", backsocket.nickname);
  });
  backsocket.on("disconnecting", () => {
    backsocket.rooms.forEach((room) => backsocket.to(room).emit("bye", backsocket.nickname));
  });
  backsocket.on("new_message", (msg, room, done) => {
    backsocket.to(room).emit("new_message", `${backsocket.nickname}: ${msg}`);
    done();
  });
  backsocket.on("nickname", (nickname) => (backsocket["nickname"] = nickname));
});

httpServer.listen(3000, handleListen);

// const wss = new WebSocket.Server({ server });
// const Backsockets = [];
// wss.on("connection", (Backsocket) => {
//   Backsockets.push(Backsocket);
//   Backsocket["nickname"] = "Anon";
//   console.log("Connected to Browser!!");
//   Backsocket.on("close", () => console.log("Disconnected to Browser!!"));
//   Backsocket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       case "new_message":
//         Backsockets.forEach((aSocket) =>
//           aSocket.send(`${Backsocket.nickname}:${message.payload}`)
//         );
//         break;
//       case "new_nickname":
//         Backsocket["nickname"] = message.payload;
//         break;
//     }
//   });
// });
