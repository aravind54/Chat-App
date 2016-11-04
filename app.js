var app = require('express')();
var bodyParser = require('body-parser')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose=require('mongoose');

var from = "",to = "",usernames=[];
var z= 0;
var date = new Date();

app.set('view engine','ejs');

// mongoose.connect('mongodb://localhost/cht');
// var db= mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   console.log("Database connected");
// });

// var chatschema = mongoose.Schema({
//   time:String,
//   from:String,
//   to:String,
//   message:String
// });

// var connectedusers = mongoose.Schema({
//   name:String,
//   ids:String
// });

// var chat = mongoose.model('chatdata',chatschema);
// var users = mongoose.model('ConnectedUsers',connectedusers);


app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', function(req, res){
  res.render('../index.ejs');
});
 
// app.post('/socketid',function(req,res){
//   console.log(req.body.id);
//   console.log(req.body.name);
//   var user = new users({name:req.body.name,ids:req.body.id});
//   user.save(function(err,sucess){
//     if (err) {
//       console.log("err");
//     }
//     else{
//       console.log("sucess");
//       z=z+1;
//     }
//   });
// });

// app.get('/admin/:username',function(req,res){
//   to=req.params.username;
//   res.render('../index.ejs');
// });

// app.get('/connectedusers',function(req,res){
//   console.log("called");
//   users.find(function(err,usersdetails){
//     if (err) {
//       console.log("error");
//     }
//     else{
//       console.log(usersdetails);
//       res.render('../index.ejs',{userdetails:usersdetails});
//     }
//   });
// });


app.get('/:username',function(req,res){
  console.log("called");
  console.log(req.params.username);
  to=req.params.username;
  res.render('../messages.ejs');
});

io.sockets.on('connection', function(socket){
   // console.log(to);
   //  users.find({name:to},function(err,user){
   //    if (err) {
   //      console.log("error");
   //    }
   //    else
   //    {
   //      //console.log(user[0].ids);
   //      //socket.broadcast.to(user[0].ids).emit('chat message',msg);
   //    }
   //  });
  socket.on('disconnect',function(){
    if (!socket.usernames)return;
    usernames.splice(usernames.indexOf(socket.usernames),1);
    io.sockets.emit('usernames',usernames);
  });
  socket.on('id',function(msg){
    console.log(msg);
  });
  socket.on('chat message', function(msg){
    io.sockets.emit('chat message',{msg:msg,username:socket.usernames});
  });
  socket.on('typing',function(msg){
    socket.broadcast.emit('typing', socket.usernames+"is typing");
  });
  socket.on('username',function(data,callback){
    if (usernames.indexOf(data)!=-1) {
      callback(false);
    }
    else{
      callback(true);
      socket.usernames=data;
      usernames.push(socket.usernames);
      io.sockets.emit('usernames',usernames);
    }
  });
  socket.on('message',function(data){
    io.to(to).emit('message',data);
  });

});
  
http.listen(3000,function(){
 console.log('listening on *:3000');
});