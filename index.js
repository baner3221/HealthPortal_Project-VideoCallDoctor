const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
var roomId = "";


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.get('/', (req, res) => {
  res.render("chatHome", {title: "Video Call"});
});

app.post("/", function(req, res){
  roomId = req.body.roomId;
  res.redirect(`/${roomId}`);
});

app.get("/:roomId", function(req, res){
  res.render("room",{roomId: req.params.roomId});
});

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });
  });
});

server.listen(8000);
