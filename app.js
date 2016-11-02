var app = require('express')();
var bodyParser = require('body-parser')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongojs=require('mongojs');
var db = mongojs('cht',['ChatData']);
var x="";
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', function(req, res){
  res.sendfile('index.html');
});
// app.post('/username',function(req,res){
//   console.log(req.body.name);
  
// });
io.on('connection', function(socket){
  socket.on('disconnect',function(){
  });
  socket.on('chat message', function(msg){
    io.emit('chat message',msg);
  });
  socket.on('typing',function(msg){
    socket.broadcast.emit('typing',"user is typing");
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});