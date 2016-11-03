var app = require('express')();
var bodyParser = require('body-parser')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose=require('mongoose');

var from = "",to = "",username="";

var date = new Date();

app.set('view engine','ejs');

mongoose.connect('mongodb://localhost/cht');
var db= mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Database connected");
});

var chatschema = mongoose.Schema({
  time:String,
  from:String,
  to:String,
  message:String
});

var connectedusers = mongoose.Schema({
  name:String
});

var chat = mongoose.model('chatdata',chatschema);
var users = mongoose.model('ConnectedUsers',connectedusers);


app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', function(req, res){
  res.render('../index.ejs',{userdetails:""});
});
 app.post('/username',function(req,res){
  console.log(req.body.name);
  username = req.body.name;
  var user = new users({name:username});
  user.save(function(error,sucess){
    if(error){
      console.log(error);
    }
    else
    {
      console.log("sucess");
    }
  });
});

app.get('/admin/:username',function(req,res){
  var userName=req.params.username;
  console.log(userName);
});

app.get('/connectedusers',function(req,res){
  console.log("called");
  users.find(function(err,usersdetails){
    if (err) {
      console.log("error");
    }
    else{
      console.log(usersdetails);
      res.render('../index.ejs',{userdetails:usersdetails});
    }
  });
});

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