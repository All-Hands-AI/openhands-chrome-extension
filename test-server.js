/**
 * Test server to demonstrate how the server-side endpoint would work
 * 
 * This is a simple Express.js server that implements the endpoint
 * needed to handle the redirected requests from the Chrome extension.
 * 
 * To run this server:
 * 1. Install dependencies: npm install express
 * 2. Run the server: node test-server.js
 * 3. The server will listen on port 12000
 */

const express = require('express');
const app = express();
const port = 12000;

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Serve static files from the current directory
app.use(express.static(__dirname));

// Endpoint to handle extension requests
app.get('/api/extension/launch', (req, res) => {
  try {
    // Get the data and key from the query parameters
    const { data, key } = req.query;
    
    if (!data || !key) {
      return res.status(400).send('Missing required parameters');
    }
    
    // Decode and parse the data
    const conversationData = JSON.parse(decodeURIComponent(data));
    
    // In a real implementation, we would validate the API key and create the conversation
    // For this demo, we'll just log the data and redirect to a success page
    console.log('Received data:', conversationData);
    console.log('API key:', key);
    
    // Create a simple HTML response
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OpenHands Conversation Started</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #24292f;
          }
          
          h1 {
            font-size: 24px;
            margin-bottom: 20px;
            border-bottom: 1px solid #d0d7de;
            padding-bottom: 10px;
          }
          
          .success {
            background-color: rgba(165, 231, 94, 0.2);
            color: #116329;
            border: 1px solid #A5E75E;
            padding: 10px;
            border-radius: 6px;
            margin-top: 10px;
          }
          
          pre {
            background-color: #f6f8fa;
            border: 1px solid #d0d7de;
            border-radius: 6px;
            padding: 10px;
            overflow-x: auto;
          }
        </style>
      </head>
      <body>
        <h1>OpenHands Conversation Started</h1>
        
        <div class="success">
          <strong>Success!</strong> Your conversation has been started.
        </div>
        
        <h2>Conversation Data:</h2>
        <pre>${JSON.stringify(conversationData, null, 2)}</pre>
        
        <p>In a real implementation, you would be redirected to the conversation page.</p>
      </body>
      </html>
    `;
    
    res.send(html);
  } catch (error) {
    console.error('Error handling extension request:', error);
    res.status(500).send('An error occurred while processing your request');
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Test server listening at http://localhost:${port}`);
  console.log(`Access the demo page at http://localhost:${port}/demo.html`);
});