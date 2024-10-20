const express = require('express');
const http = require('http');  // Use http to create a server
const cors = require('cors');
const WebSocket = require('ws');
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://manvir98:manvir98@cluster0.ob343.mongodb.net/";

let db, featuresCollection;

// Function to connect to MongoDB
const connectToDB = async () => {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect(); // Connect the client to the MongoDB server
    db = client.db('feature-announcements'); // Database name
    featuresCollection = db.collection('features'); // Collection name

    console.log("Connected to MongoDB!");

    // Initialize the sample features if the collection is empty
    const featuresCount = await featuresCollection.countDocuments();
    if (featuresCount === 0) {
      await featuresCollection.insertMany([
        { id: 1, title: "New Dashboard", description: "A brand new look for our dashboard" },
        { id: 2, title: "Enhanced Security", description: "Two-factor authentication is now available" }
      ]);
      console.log("Initialized sample features");
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

// Express app setup
const app = express();
app.use(cors());
app.use(express.json());  // Allow JSON body parsing for POST requests

// API to get features
app.get('/features', async (req, res) => {
  try {
    const features = await featuresCollection.find().toArray(); // Fetch features from MongoDB
    res.json(features);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching features', error: err.message });
  }
});

// POST API to add a new feature
app.post('/add-feature', async (req, res) => {
  try {
    const newFeature = req.body;
    const lastFeature = await featuresCollection.find().sort({ id: -1 }).limit(1).toArray();
    const newId = lastFeature.length > 0 ? lastFeature[0].id + 1 : 1;
    newFeature.id = newId;

    await featuresCollection.insertOne(newFeature); // Insert new feature into MongoDB
    broadcastNewFeature(newFeature);  // Notify all WebSocket clients of the new feature
    res.status(201).json({ message: 'Feature added and broadcasted to users' });
  } catch (err) {
    res.status(500).json({ message: `Error adding feature: ${err.message}` });
  }
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket server setup
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

// Start the server and connect to MongoDB
const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectToDB(); // Connect to the MongoDB database
});
