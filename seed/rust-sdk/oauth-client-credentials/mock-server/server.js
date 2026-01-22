const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Track requests for verification
const requestLog = [];

// Middleware to log all requests
app.use((req, res, next) => {
    requestLog.push({
        method: req.method,
        path: req.path,
        headers: { ...req.headers },
        body: req.body,
        timestamp: new Date().toISOString()
    });
    next();
});

// OAuth token endpoint
app.post('/token', (req, res) => {
    console.log('[OAuth] Token request received');
    console.log('  Body:', JSON.stringify(req.body));
    
    // Validate client credentials
    const clientId = req.body.client_id;
    const clientSecret = req.body.client_secret;
    
    if (!clientId || !clientSecret) {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'Missing client_id or client_secret'
        });
    }
    
    // Return a valid OAuth token response
    const tokenResponse = {
        access_token: `test_access_token_${Date.now()}`,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'test_refresh_token'
    };
    
    console.log('[OAuth] Returning token:', tokenResponse.access_token);
    res.json(tokenResponse);
});

// Protected API endpoint - requires Bearer token
app.get('/get-something', (req, res) => {
    console.log('[API] GET /get-something request received');
    
    const authHeader = req.headers.authorization;
    console.log('  Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'unauthorized',
            error_description: 'Missing or invalid Authorization header'
        });
    }
    
    const token = authHeader.substring(7);
    console.log('  Token:', token);
    
    // Return success response
    res.json(null);
});

// Admin endpoint to get request log (simple format)
app.get('/__admin/requests', (req, res) => {
    res.json(requestLog);
});

// WireMock-compatible: Find requests matching criteria
app.post('/__admin/requests/find', (req, res) => {
    const { method, urlPath } = req.body;
    
    const matchingRequests = requestLog.filter(r => {
        const methodMatch = !method || r.method === method;
        const pathMatch = !urlPath || r.path === urlPath;
        return methodMatch && pathMatch;
    });
    
    // Return in WireMock format
    res.json({
        requests: matchingRequests
    });
});

// WireMock-compatible: Delete all requests (reset)
app.delete('/__admin/requests', (req, res) => {
    requestLog.length = 0;
    res.json({ status: 'ok' });
});

// Admin endpoint to reset request log
app.post('/__admin/reset', (req, res) => {
    requestLog.length = 0;
    res.json({ status: 'ok' });
});

// Admin endpoint for health check
app.get('/__admin/health', (req, res) => {
    res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`OAuth Mock Server running on http://localhost:${PORT}`);
    console.log('Endpoints:');
    console.log('  POST /token - OAuth token endpoint');
    console.log('  GET /get-something - Protected API endpoint');
    console.log('  GET /__admin/requests - View request log');
    console.log('  POST /__admin/reset - Reset request log');
    console.log('  GET /__admin/health - Health check');
});
