const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");

const { generateMsg } = require("./utils/msg");
const { isRealString } = require("./utils/validation.js");
const { Users } = require("./utils/users");

const public = path.join(__dirname, "../public");
const port = process.env.PORT || 5000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(public));

// fired when new connection is made from client
io.on("connection", socket => {
  console.log("New user added!!");

  socket.on("join", (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room))
      return callback("Name and room name are required!!");
    else if (users.getUserByName(params.name))
      return callback("User already present! Please login with a new name!");

    params.room = params.room.toLowerCase();
    socket.join(params.room);
    users.removeUser(socket.id);

    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit("updateUsersList", users.getUsersList(params.room));
    socket.emit("newMessage", generateMsg("Admin", "Welcome to chat Room!!"));
    socket.broadcast
      .to(params.room)
      .emit("newMessage", generateMsg("Admin", `${params.name} has joined.`));

    callback();
  });

  socket.on("createMessage", (newMessage, callback) => {
    var user = users.getUser(socket.id);

    if (user && isRealString(newMessage.text))
      io.to(user.room).emit(
        "newMessage",
        generateMsg(user.name, newMessage.text)
      );

    callback();
  });

  // fired when a client disconnects
  socket.on("disconnect", () => {
    var user = users.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("updateUsersList", users.getUsersList(user.room));
      io.to(user.room).emit(
        "newMessage",
        generateMsg("Admin", `${user.name} has left the group!`)
      );
    }
    console.log("user disconnected!!");
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
