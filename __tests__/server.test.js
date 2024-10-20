const request = require('supertest');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Mock the server setup
const app = express();
app.use(express.json());

let features = [
    { id: 1, title: "New Dashboard", description: "A brand new look for our dashboard" },
    { id: 2, title: "Enhanced Security", description: "Two-factor authentication is now available" }
];

// Test the `/features` GET route
app.get('/features', (req, res) => {
    res.json(features);
});

// Test the `/add-feature` POST route
app.post('/add-feature', (req, res) => {
    const newFeature = req.body;
    newFeature.id = features.length + 1;
    features.push(newFeature);
    res.status(201).json({ message: 'Feature added' });
});

describe('Feature Announcement API', () => {
    it('should get all features', async () => {
        const response = await request(app).get('/features');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2); // Test for 2 existing features
        expect(response.body[0].title).toBe('New Dashboard');
    });

    it('should add a new feature', async () => {
        const newFeature = { title: 'New API', description: 'Integration of new API' };
        const response = await request(app).post('/add-feature').send(newFeature);
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Feature added');
        
        // Check if the feature list has been updated
        const getResponse = await request(app).get('/features');
        expect(getResponse.body.length).toBe(3); // Now it should have 3 features
    });
});
