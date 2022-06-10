const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const app = express();
const PORT = process.env.PORT || 3000;
const formatMessage = require("./utils/messages");
const { format } = require("path");
// const { dbconnect, dbtestconection } = require("./db");

const {
  connectmongo,
  addordermongo,
  getoldorders,
  getneworders,
  updateorders,
  getallorders
} = require("./mongo");

var db;
var neworders = [];
var doneorders = [];
var alldata = []


const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public/root/examples")));

const admin = "admin";

// Run when a client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    socket.emit("message", formatMessage(admin, "welcome to the chat"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(admin, `${user.username} has joined the chat!`)
      );
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });


  // RECEIVE AN ORDER
  socket.on("submitorder", (msg) => {
    msg.did = socket.id;
    msg.status = 0;
    neworders.push(msg);
    io.sockets.emit("replyneworders", neworders);
    console.log(neworders);
    addordermongo(msg);
  });

  socket.on("requestneworders", (msg) => {
    neworders = []
    getneworders().then((data) => {
      data.map((val) => {
        neworders.push(val);
      });
      socket.emit("replyneworders", neworders);
    });
  });

  socket.on("joinkitchen", async (msg) => {
    getoldorders().then((data) => {
      console.log("data is here kitchen=>", data);
      socket.emit("oldolders", data);
      doneorders = data;
    });
  });


  socket.on("joinreport", async (msg) => {
    getallorders().then((data) => {
      // console.log("all", data);
      socket.emit("alldata", data);
      alldata = data;
    });
  });




  socket.on("closeorder", async (did) => {
    // remove item from neworders, send through the new orders,
    const index = neworders.findIndex((ord) => ord.did === did.did);
    console.log(index);
    console.log(did.did);
    if (index !== -1) {
      var newold = neworders.splice(index, 1)[0];
      io.sockets.emit("replyneworders", neworders);
      newold.status = 1;
      doneorders.push(newold);
      io.sockets.emit("oldolders", doneorders);

      getallorders().then((data) => {
        io.sockets.emit("alldata", data);
        alldata = data;
      });


    }

    ///remove from the database and
    updateorders(did.did)
  });

  // User disconnects
  // socket.on("disconnect", () => {
  //   const user = userLeave(socket.id);

  //   if (user) {
  //     io.to(user.room).emit(
  //       "message",
  //       formatMessage(admin, `${user.username} has left the chat`)
  //     );

  //     io.to(user.room).emit("roomUsers", {
  //       room: user.room,
  //       users: getRoomUsers(user.room),
  //     });
  //   }
  // });
});

server.listen(PORT, async () => {
  console.log(`Server running on ${PORT}..`);
  // dbconnect();
  // dbtestconection();
  connectmongo();
});

function getinitialdata() {
  // GET ALL APPRORIATE DATA WHEN SERVER STARTS****************************
  getneworders().then((data) => {
    //NEW ORDERS
    data.map((val) => {
      neworders.push(val);
    });
  });
  getoldorders().then((data) => {
    //OLD ORDERS
    console.log("old =>", data);
    doneorders = data;
  });
}
