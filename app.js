var app = require('express')();
var bodyParser = require('body-parser')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose=require('mongoose');

var from = "",to = " ",usernames={};
var z= 0;
var date = new Date();

app.set('view engine','ejs');

mongoose.connect('mongodb://localhost/cht');
var db= mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Database connected");
});

var chatschema = mongoose.Schema({
  time:{type:Date,default:Date.now()},
  from:String,
  to:String,
  message:String
});

// var connectedusers = mongoose.Schema({
//   name:String,
//   ids:String
// });

var chat = mongoose.model('chatdata',chatschema);
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


app.post('/:username',function(req,res){
  console.log(usernames);
  if (req.params.username in usernames) {
    to = req.params.username;
  }
  else{
    to="everyone";
    console.log(to);
  }
  chat.find({to:to}).sort({time:'ascending'}).exec(function(err,docs){
    if (err) {
      console.log("Error");
    }
    else{
      res.send(docs);
      console.log(docs);
    }
  });
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


  // socket.on('disconnect',function(){
  //   if (!socket.usernames)return;
  //   delete usernames[socket.usernames];
  //   io.sockets.emit('usernames',Object.keys(usernames));
  // });
 
  socket.on('chat message', function(msg){
    console.log(socket.id);
    if (to in usernames) {
      socket.to = to;
      console.log("socket"+socket.to);
      var message = new chat({from:socket.usernames,to:socket.to,message:msg});
      if (to!=socket.usernames) {
        usernames[socket.to].emit('chat message',{msg:msg,username:socket.usernames});
        usernames[socket.usernames].emit('chat message',{msg:msg,username:socket.usernames});
      }
      else{
        usernames[socket.to].emit('chat message',{msg:msg,username:socket.usernames});
      }
    }    
    else{
      var message = new chat({from:socket.usernames,to:"everyone",message:msg});
      io.sockets.emit('chat message',{msg:msg,username:socket.usernames});
    }
    message.save(function(err,sucess){
      if (err) {
        console.log("Error");
      }
      else{
        console.log("sucess");
      }
    });
  });
  socket.on('typing',function(msg){
    socket.broadcast.emit('typing', socket.usernames+"is typing");
  });
  socket.on('username',function(data,callback){
    if (data in usernames) {
      callback(false);
    }
    else{
      callback(true);
      socket.usernames=data;
      usernames[socket.usernames]=socket;
      io.sockets.emit('usernames',Object.keys(usernames));
    }
  });
  socket.on('message',function(data){
    console.log("called");
    socket.broadcast.to(to).emit('message',data);
  });
  socket.on('notifications',function(data){
    if (to in usernames) {
      socket.to = to;
      usernames[socket.to].emit('notifications',{msg:data,username:socket.usernames});
      usernames[socket.usernames].emit('notifications',{msg:data,username:socket.usernames});
    }    
    else{
      io.sockets.emit('notifications',{msg:data,username:socket.usernames});
    }
  });
});
  
http.listen(3000,function(){
 console.log('listening on *:3000');
});