const request = require('supertest');

describe('Feature Announcement API - Integration Tests', () => {

    const baseUrl = 'http://localhost:3001';  // Use the running server URL

    // Test getting all features
    it('should return a list of all features', async () => {
        const response = await request(baseUrl).get('/features');
        
        // Check if the status code is correct
        expect(response.statusCode).toBe(200);
        
        // Check if the response contains the correct data
        expect(response.body.length).toBe(2);
        expect(response.body[0]).toHaveProperty('title', 'New Dashboard');
        expect(response.body[1]).toHaveProperty('description', 'Two-factor authentication is now available');
    });

    // Test adding a new feature
    it('should add a new feature to the list', async () => {
        const newFeature = { title: 'API Enhancements', description: 'New API integrations added' };
        const response = await request(baseUrl).post('/add-feature').send(newFeature);
        
        // Check if the status code is correct
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('message', 'Feature added and broadcasted to users');

        // Verify the feature was added by making another GET request
        const getResponse = await request(baseUrl).get('/features');
        expect(getResponse.body.length).toBe(3);
        expect(getResponse.body[2]).toHaveProperty('title', 'API Enhancements');
    });
});
