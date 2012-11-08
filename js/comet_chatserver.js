
/*
 * COMET_CHATSERVER.JS
 * 
 * Ex18.17 from O'Reilly'
 */
// This is server-side JavaScript, intended to be run with NodeJS.
// It implements a very simple, completely anonymous chat room.
// POST new messages to /chat, or GET a text/event-stream of messages
// from the same URL. Making a GET request to / returns a simple HTML file
// that contains the client-side chat UI.
var http = require('http');  // NodeJS HTTP server API

// The HTML file for the chat client. Used below.
var clientui = require('fs').readFileSync("index.html");
//var emulation = require('fs').readFileSync("EventSourceEmulation.js");

// An array of ServerResponse objects that we're going to send events to
var clients = [];

// Send a comment to the clients every 20 seconds so they don't 
// close the connection and then reconnect

startTime = new Date().getTime();

setInterval(function() {
    clients.forEach(function(client) {
        client.write(":ping\n");
    });
    var time = new Date().getTime() - startTime;
    console.log(parseInt(time/1000)+":"+time%1000+": ping");
}, 20000);

// Create a new server
var server = new http.Server();  

// When the server gets a new request, run this function
server.on("request", function (request, response) {
    // Parse the requested URL
    var url = require('url').parse(request.url);

    console.log("got a request for "+url.pathname);
    
    // Um.. If the request was for "/the js", send the client-side chat UI.
    if (url.pathname.slice(0,3) === "/js") {  // A request for the chat UI /js/comet_chatclient.js"
        response.writeHead(200, {"Content-Type": "text/html"});
        
        console.log("got a request for /js/"+url.pathname.slice(4));
        
        response.write(require('fs').readFileSync("js/"+url.pathname.slice(4)));
        response.end();
        return;
    }
    
    // If the request was for "/", send the client-side chat UI.
    if (url.pathname === "/") {  // A request for the chat UI
        response.writeHead(200, {"Content-Type": "text/html"});
//        response.write("<script>" + emulation + "</script>");
        response.write(clientui);
        response.end();
        console.log("its an initial open request. served index.html");
        return;
    }
    // Send 404 for any request other than "/chat"
    else if (url.pathname !== "/chat") {
        response.writeHead(404);
        response.end();
        console.log("404: its an unrecognised request");
        return;
    }

    // If the request was a post, then a client is posting a new message
    if (request.method === "POST") {
        console.log("POST received");
        
        request.setEncoding("utf8");
        var body = "";
        // When we get a chunk of data, add it to the body
        request.on("data", function(chunk) { body += chunk; });

        // When the request is done, send an empty response 
        // and broadcast the message to all listening clients.
        request.on("end", function() {
            response.writeHead(200);   // Respond to the request
            response.end();

            // Format the message in text/event-stream format
            // Make sure each line is prefixed with "data:" and that it is
            // terminated with two newlines.
            message = 'data: ' + body.replace('\n', '\ndata: ') + "\r\n\r\n";
            // Now send this message to all listening clients
            clients.forEach(function(client) { client.write(message); });
        });
    }
    // Otherwise, a client is requesting a stream of messages
    else {
        console.log("GET received. opening chat stream ");
        // Set the content type and send an initial message event 
        response.writeHead(200, {'Content-Type': "text/event-stream" });
        response.write("data: Connected\n\n");

        // If the client closes the connection, remove the corresponding
        // response object from the array of active clients
        request.connection.on("end", function() {
            clients.splice(clients.indexOf(response), 1);
            response.end();
        });

        // Remember the response object so we can send future messages to it
        clients.push(response);
    }
});

// Run the server on port 8000. Connect to http://localhost:8000/ to use it.
server.listen(8000);
