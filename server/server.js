const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const {generateMessage,generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));
//io.on listens to connection from client.
io.on('connection', (socket) => {
    console.log('new user connection');   
   
    socket.on('join',(params,callback)=>{
     if(!isRealString(params.name) || !isRealString(params.room))
     {
       return callback('Room and name are required');
     }
     
     socket.join(params.room);
     users.removeUser(socket.id);
     users.addUser(socket.id, params.name, params.room);
     io.to(params.room).emit('updateUserList',users.getUserList(params.room));

     socket.emit('newMessage',generateMessage('Admin','Welcome to the app'));
     socket.broadcast.to(params.room).emit('newMessage',generateMessage('Admin',`${params.name} has joined the app`));


         callback();
    });
   
    socket.on('createMessage',(message,callback)=>{
        var user = users.getUser(socket.id);
        if(user && isRealString(message.text)){
        io.to(user.room).emit('newMessage',generateMessage(user.name, message.text) );
        }
        callback();
    });

    socket.on('createLocationMessage',(coords)=>{
        var user = users.getUser(socket.id);
        if(user){  
            io.to(user.room).emit('newLocationMessage',generateLocationMessage(user.name,coords.latitude,coords.longitude));
        }
    });

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);
        if(user)
        {
          io.to(user.room).emit('updateUserList',users.getUserList(user.room));
          io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.name} has left the room`));
        }
    });
});


server.listen(port, () => {
    console.log(`server is up on port ${port}`);
});

