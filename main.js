/*
Rocket Chat Real Time API Custom Client


even though this code works great I don't know what exactly each event we listen for is doing
you can go back to rocket chat real time api for further declarations

we were able to write this code after we test real normal use case of livechat in a web page
and we listen for WebSocket connection inside the browser Network tab(by filtering ws(WebSocket) connections)
*/


let socket = new WebSocket('ws://[rocketChatIP]:[rocketChatPort]/websocket');

//note messageCount is incremented with every message
//but it can works even if you didn't change it
let messagesCount = 1;

// the variables chatToken and chatRoomId are very important
// and they are the identifier to the room(the whole chat) you are using
// if you want to get access to the chat again you need these two variables tokens
let chatToken = generateHash(17); 
let chatRoomId = generateHash(17);

let subId = generateHash(17);
let roomSubId = generateHash(17);
let streamLivechatchatRoomId = generateHash(17);
let steamNotifyRoomSubId = generateHash(17);

let name = 'user28';
let email = 'user28@gmail.com';
let guestName = 'guest';


// listen to messages passed to this socket
socket.onmessage = function(e){

	let response = JSON.parse(e.data);
	console.log('response', response);

  // you have to pong back if you need to keep the connection alive
  // each ping from server need a 'pong' back
  if(response.msg == 'ping'){
      console.log('pong!');
      socket.send(JSON.stringify({msg: 'pong'}));
      return;
  }

  // here you receive messages from server //notive the event name is: 'stream-room-messages'
  if(response.msg === 'changed' && response.collection === 'stream-room-messages'){
    console.log('msg received ' ,response.fields.args[0].msg, 'timestamp ', response.fields.args[0].ts.$date, 'from ' + response.fields.args[0].u.name);
    return;
  }

  // receive all messages which will only succeed if you already have messages
  // in the room (or in case you send the first message immediately you can listen for history correctly)
  if(response.msg === 'result' && response.result){
    if(response.result.messages){
      let allMsgs =  response.result.messages;
      console.log('-----previous msgs---------------');
      allMsgs.map(x => console.log(x))
      console.log('---------------------------------')
    }
  }
}

//////////////////////////////////////////////
// steps to achieve the connection to the rocket chat real time api through WebSocket


//1 connect
let connectObject = {
    msg: 'connect', 
    version: '1', 
    support: ['1','pre2','pre1']
}

setTimeout(()=>{
    socket.send(JSON.stringify(connectObject));
},1000)

//////////////////////////////////////////////

//2 getInitialData
let getInitialDataObject = {
    msg: 'method', 
    method: 'livechat:getInitialData', 
    params: [String(chatToken), null],
    id: String(messagesCount++),
}

setTimeout(()=>{
    socket.send(JSON.stringify(getInitialDataObject));
},2000)

//////////////////////////////////////////////

//3 loginByToken
let loginByToken = {
  msg:'method',
  method:'livechat:loginByToken',
  params:[String(chatToken)],
  id:String(messagesCount++),
}

setTimeout(()=>{
    socket.send(JSON.stringify(loginByToken));
},3000)

//////////////////////////////////////////////

//4 subscribtion 
let subObj = {
  msg:'sub',
  id:subId,
  name:'meteor.loginServiceConfiguration',
  params:[]
}

setTimeout(()=>{
    socket.send(JSON.stringify(subObj));
},4000)

//////////////////////////////////////////////

//5 register // you may skip this if you alredy registered
// or you can re use it even though you are registered.. no problems
// the crucial part is the `chatToken` and later on the `chatRoomId`

let registerObj = {
  msg:'method',
  method:'livechat:registerGuest',
  params:[{
    token:chatToken,
    name: name,
    email:email,'department':null
  }],
  id:String(messagesCount++),
};


setTimeout(()=>{
    socket.send(JSON.stringify(registerObj));
},5000)

//////////////////////////////////////////////////

//6 stream-notify-room

let streamNotifyObj = {
  msg:'method',
  method:'stream-notify-room',
  params:[
  'null/typing',
  guestName,true,{token:String(chatToken)}
  ],
  id:String(messagesCount++)
};

setTimeout(()=>{
    socket.send(JSON.stringify(streamNotifyObj));
},6000)

//////////////////////////////////////////////////

//7 send a msg //use the same method to send your own messages again when you are all connected
let myMsg = {
  msg:'method',
  method:'sendMessageLivechat',
  params:[{
    _id:String(generateHash(17)),
    rid:chatRoomId,
    msg:'first message',
    token:String(chatToken),
  },null],
  id:String(messagesCount++),
}


setTimeout(()=>{
    socket.send(JSON.stringify(myMsg));
},7000)

//////////////////////////////////////////////////

//8 send userPresence
let UserPresence = {
  msg:'method',
  method:'UserPresence:connect',
  params:[
    String(chatToken),
    {visitor:String(chatToken)}
  ],
  id:String(messagesCount++)
}

setTimeout(()=>{
    socket.send(JSON.stringify(UserPresence));
},8000)

/////////////////////////////////////////////////

//9 loadHistory of old messages 

let loadHistory = {
  msg:'method',
  method:'livechat:loadHistory',
  params:[{
    token:String(chatToken),
    rid:String(chatRoomId),
    ts:{ $date: new Date().getTime() }, //current point of time
    limit:50
  }],
  id:String(messagesCount++)
};

setTimeout(()=>{
    socket.send(JSON.stringify(loadHistory));
},9000)


/////////////////////////////////////////////////

// 10 stream-room-messages
// listen to all received messages

let roomMessagesSub = {
  msg:'sub',
  id:String(roomSubId),
  name:'stream-room-messages',
  params:[
    String(chatRoomId),
    {
      useCollection:false,
      args:[{visitorToken:String(chatToken)}]
    }
  ]
};

setTimeout(()=>{
    socket.send(JSON.stringify(roomMessagesSub));
},10000)

/////////////////////////////////////////////////

// 11 getAgentData
let getAgentData = {
  msg:'method',
  method:'livechat:getAgentData',
  params:[{
    roomId:String(chatRoomId),
    token:String(chatToken),
  }],
  id:String(messagesCount++)
}

setTimeout(()=>{
    socket.send(JSON.stringify(getAgentData));
},11000)

/////////////////////////////////////////////////

//12 stream-livechat-room
let streamLivechatRoom = {
  msg:'sub',
  id:String(streamLivechatchatRoomId),
  name:'stream-livechat-room',
  params:[
  String(chatRoomId),
  {
    useCollection:false,
    args:[{'visitorToken':String(chatToken)}]
  }]
}

setTimeout(()=>{
    socket.send(JSON.stringify(streamLivechatRoom));
},12000)

//////////////////////////////////////////

//13 stream-notify-room
let steamNotifyRoomSub = {
  msg:'sub',
  id:String(steamNotifyRoomSubId),
  name:'stream-notify-room',
  params:[
  `${String(chatRoomId)}/typing`,
  {
    useCollection:false,args:[{token:String(chatToken)}]
  }]
}

setTimeout(()=>{
    socket.send(JSON.stringify(steamNotifyRoomSub));
},13000)

//////////////////////////////////////

//14 userpresence 2
let UserPresence2 = {
  msg:'method',
  method:'UserPresence:online',
  params:[String(chatToken)],
  id:String(messagesCount++),
}

setTimeout(()=>{
    socket.send(JSON.stringify(UserPresence2));
},14000)


//////////////////////////////////////


//use it to send new messages
function sendNewMsg(msg, messagesCount){

  let myMsg = {
    msg: 'method',
    method: 'sendMessageLivechat',
    params: [{
      _id: String(generateHash(17)),
      rid: chatRoomId,
      msg: String(msg),
      token: String(chatToken),
    },null],
    id:String(messagesCount++),
  }

  setTimeout(()=>{
      socket.send(JSON.stringify(myMsg));
  },500);

}


function generateHash(targetLength) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < targetLength; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

