/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var url = require('url');
var queryString = require('querystring');

var Message = function (roomname, username, text, createdAt) {
  this.roomname = roomname;
  this.username = username;
  this.text = text;
  this.createdAt = createdAt || (new Date()).toString();
  this.objectId = Date.now();
  this.updatedAt = this.createdAt;
};  

var database = [new Message("lobby", 'badboy34', 'this is the first message. I rule!', (new Date('December 17, 1995 03:24:00')).toString() )];

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  //console.log('Serving request type ' + request.method + ' for url ' + request.url);
  //if (request.url !== '/chatterbox/classes/messages') {
   // console.log(request.url);
  // }
  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  if (!(new RegExp('^/chatterbox/classes/messages?', 'i')).test(request.url) && request.url !== '/chatterbox/classes/messages') {
    response.writeHead(404, headers);
  }
  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  response.writeHead(statusCode, headers);
  if (request.method === 'OPTIONS') {
    response.end();
  }
  if (request.method === 'GET') {
    headers['Content-Type'] = 'application/json';
    //console.log(JSON.stringify(database));
    response.end(JSON.stringify({results: database.map((message) => message)}));

  } else if (request.method === 'POST') {
    response.writeHead(201, headers);
    var body = [];
    request.on('data', function (chunk) {
      body.push(chunk);
    });
    request.on('end', function () {
      var params = queryString.parse(body.join(''));
      var path = request.url;
      // console.log(path);
      // console.log(params.text);
      var newMessage = new Message(params.roomname, params.username, params.text);
      database.unshift(newMessage);
      response.end(JSON.stringify('Awesome M8'));
      // response.end(JSON.stringify(newMessage));
    });
    // request.on('error', function (err) {
    //   console.log(err);
    // });
  }

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  ///response.end('assadfa');
};

module.exports.requestHandler = requestHandler;
