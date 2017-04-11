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
var url = require('url');
var queryString = require('querystring');
var fs = require('fs');
var serve = require('./serveHTML');
var Database = require('./database');

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var Message = function (roomname, username, text, createdAt) {
  this.roomname = roomname;
  this.username = username;
  this.text = text;
  this.createdAt = createdAt || (new Date()).toString();
  this.objectId = Date.now();
  this.updatedAt = this.createdAt;
  this.message = text;
};  

var database = new Database.Database('messages.txt');

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

  var restEndpoint = require('url').parse(request.url).pathname;
  //console.log('~~~~~~~~~~~~~~~~~~~~~~~>>>>>', restEndpoint)
  
  if (restEndpoint !== '/classes/messages' && restEndpoint !== '/chatterbox/classes/messages') {
    serve(request, response);
    return;
    // response.writeHead(404, headers);
    // response.end();
    // return;
  }
  response.writeHead(statusCode, headers);
  if (request.method === 'OPTIONS') {
    response.end();
  }
  if (request.method === 'GET') {
    headers['Content-Type'] = 'application/json';
    
    response.end(JSON.stringify({results: database.data()}));

  } else if (request.method === 'POST') {
    response.writeHead(201, headers);
    var body = [];
    request.on('data', function (chunk) {
      body.push(chunk);
    });
    request.on('end', function () {
      body = body.join('');
      var params = body[0] === '{'? JSON.parse(body) : queryString.parse(body);
      var path = request.url;
      var newMessage = new Message(params.roomname || 'lobby', params.username, params.text || params.message);
      database.insert(newMessage);
      response.end(JSON.stringify('Awesome M8'));
    });
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
