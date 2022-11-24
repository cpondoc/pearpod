// WebSockets Stuff
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8082 });

// Creating Rooms
var rooms = {};
const numRooms = 9;
var count = 0;
for (var i = 0; i < numRooms; i++) {
    newRoom = {
        'users': [],
        'capacity': 2,
        'link': "https://stanford.zoom.us/j/9786299704?pwd=ZjdQRFBqU3pGeVNnRTdYK1Y0MnpZdz09"
    }
    rooms[i+1] = newRoom;
}

// Handling connection!
wss.on("connection", ws => {
    // Create new ID for the client
    ws.id = count;
    count += 1;

    // Send over information about the ID and the rooms
    data = {'type': 'initialization', 'rooms': rooms, 'id': ws.id}
    ws.send(JSON.stringify(data));
    console.log("New client connected!");

    // Looking at data when a client opens
    ws.on("message", e => {
        data = JSON.parse(e);

        // If we want to join a room, make sure we don't fit into capacity and do that
        if (data['type'] === 'join') {
            if (rooms[data['room']]['users'].length < rooms[data['room']]['capacity']) {
                // Remove user from existing room
                for (var i = 1; i <= numRooms; i++) {
                    for (var j = 0; j < rooms[i]['users'].length; j++) {
                        if (ws.id === rooms[i]['users'][j]) {
                            firstHalf = rooms[i]['users'].slice(0, j);
                            secondHalf = rooms[i]['users'].slice(j+1);
                            rooms[i]['users'] = firstHalf.concat(secondHalf);
                        }
                    }
                }

                // Update internal data
                rooms[data['room']]['users'].push(ws.id);
                ws.room = data['room'];

                // Return all of the data
                returnData = {'type': 'update', 'rooms': rooms, 'room': ws.room, 'link': rooms[ws.room]['link']};
                ws.send(JSON.stringify(returnData));
            }
            
        }
    })

    // When a client closes
    ws.on("close", e => {
        // Remove user from existing room
        for (var i = 1; i <= numRooms; i++) {
            for (var j = 0; j < rooms[i]['users'].length; j++) {
                if (ws.id === rooms[i]['users'][j]) {
                    firstHalf = rooms[i]['users'].slice(0, j);
                    secondHalf = rooms[i]['users'].slice(j+1);
                    rooms[i]['users'] = firstHalf.concat(secondHalf);
                }
            }
        }
        console.log("Client has disconnected!");
    })
});