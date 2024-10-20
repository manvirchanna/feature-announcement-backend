const express = require('express');
const http = require('http');  // Use http to create a server
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(express.json());  // Allow JSON body parsing for POST requests

// Sample features list
let features = [
    { id: 1, title: "New Dashboard", description: "A brand new look for our dashboard" },
    { id: 2, title: "Enhanced Security", description: "Two-factor authentication is now available" }
];

// API to get features
app.get('/features', (req, res) => {
    res.json(features);
});

// POST API to add a new feature
app.post('/add-feature', (req, res) => {
    const newFeature = req.body;

    // Auto-increment the ID based on the current features
    const newId = features.length > 0 ? features[features.length - 1].id + 1 : 1;
    newFeature.id = newId; // Assign new auto-incremented ID

    features.push(newFeature);  // Add the new feature to the list
    broadcastNewFeature(newFeature);  // Notify all connected users
    res.status(201).json({ message: 'Feature added and broadcasted to users' });
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New user connected');
    
    ws.on('close', () => {
        console.log('User disconnected');
    });
});

// Broadcast function to send new feature to all connected WebSocket clients
function broadcastNewFeature(newFeature) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(newFeature));
        }
    });
}

// Start the server on port 3001
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
