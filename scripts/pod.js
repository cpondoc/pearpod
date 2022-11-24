// Set up the initial connection to the WebSocket
const ws = new WebSocket("ws://localhost:8082");
ws.id = -1;
ws.room = -1;
var rooms = {};

// Handle rooms and such
ws.addEventListener("message", e => {
    // Parse in data
    data = JSON.parse(e.data);

    // If initialization: define the ID and set up the rooms
    if (data['type'] === 'initialization') {
        ws.id = data['id']
    }

    // If we update: set the new room
    if (data['type'] === 'update') {
        // Grab room number and link
        ws.room = data['room'];
        ws.link = data['link'];

        userPanel = `
        <div class="card">
            <div class="card-body">
                <h3>📹 Pear Information</h3>
                <p>Pear #: ` + String(ws.room) + `</p>
                <a href="` + String(ws.link) + `" target="_blank">Click here to join →</a>
            </div>
        </div>
        `
        document.getElementById("user").innerHTML = userPanel
    }

    // Update Rooms regardless
    updateRooms(data['rooms']);
})

// Update UI for rooms
function updateRooms(rooms) {
    // Empty out existing rows
    document.getElementById("rooms-1").innerHTML = ""
    document.getElementById("rooms-2").innerHTML = ""
    document.getElementById("rooms-0").innerHTML = ""

    // Iterate through each of the elements and create a new object
    for (const [key, value] of Object.entries(rooms)) {
        newCard = `
            <div class="col">
                <div class="card" style="width: 18rem;">
                        <div class="card-body">
                            <h5 class="card-title">🍐 Pear ` + String(key) + `</h5>
                            <p class="card-text">Number of Users in Room: ` + String(value['users'].length) + `</p>
                            <button type="button" class="btn btn-success" onclick=\"joinRoom(` + String(key) + `)\">Join Room</button>
                        </div>
                </div>
            </div>
            `
        // Create new card
        rowKey = key % 3
        document.getElementById("rooms-" + String(rowKey)).innerHTML += newCard
    }
}

// Join in a room
function joinRoom(x) {
    data = {'type': "join", "room": x, "id": ws.id};
    ws.send(JSON.stringify(data));
}