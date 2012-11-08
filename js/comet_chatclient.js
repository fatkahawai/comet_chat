/*
 * COMET_CHATCLIENT.JS
 * 
 * an example for Comet (server-side ajax push)
 * Ex18.15 from O'Reilly'
 * 
 * When a user browses to http://localhost:8000, index.html is loaded, which loads this file
 * to process user input messages and send to the server appliation in COMET_CHATSERVER.JS
 * and display messages from other users using comet push 
 * the comet push message is received and processed in an event handler - an anonymous function 
 * assigned to the event using .onmessage() on an EventSource
 */
var debug = utils.debug;
var sprintf = utils.string.sprintf;

window.onload = function() {
    debug.setLevelVerbose();

    // Take care of some UI details
    var nick = prompt("Enter your nickname");     // Get user's nickname
    var input = document.getElementById("input"); // Find the input field
    input.focus();                                // Set keyboard focus

    // Register for notification of new messages using EventSource
    var chat = new EventSource("/chat");
    chat.onmessage = function(event) {            // When a new message arrives
        var msg = event.data;                     // Get text from event object
        var node = document.createTextNode(msg);  // Make it into a text node
        var div = document.createElement("div");  // Create a <div>
        div.appendChild(node);                    // Add text node to div
        document.body.insertBefore(div, input);   // And add div before input
        input.scrollIntoView();                   // Ensure input elt is visible
    }
    var time = new Date().getTime();
    debug.trace("new user session started");

    // Post the user's messages to the server using XMLHttpRequest
    input.onchange = function() {                 // When user strikes return
        debug.trace("entered new message");
        var msg = nick + ": " + input.value;      // Username plus user's input
        var xhr = new XMLHttpRequest();           // Create a new XHR
        xhr.open("POST", "/chat");                // to POST to /chat.
        xhr.setRequestHeader("Content-Type",      // Specify plain UTF-8 text 
                             "text/plain;charset=UTF-8");
        xhr.send(msg);                            // Send the message
        debug.trace("sent message"+msg);
        input.value = "";                         // Get ready for more input
    }
};
