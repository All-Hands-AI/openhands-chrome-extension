/**
 * Example server-side endpoint for handling extension requests
 * 
 * This is an example of how the server-side endpoint should be implemented
 * to handle the requests from the Chrome extension. This code would be
 * implemented on the OpenHands server, not in the extension itself.
 * 
 * Path: /api/extension/launch
 * Method: GET
 * Query Parameters:
 *   - data: JSON string containing the conversation data (URL-encoded)
 *   - key: API key for authentication
 */

// Express.js example
app.get('/api/extension/launch', async (req, res) => {
  try {
    // Get the data and key from the query parameters
    const { data, key } = req.query;
    
    if (!data || !key) {
      return res.status(400).send('Missing required parameters');
    }
    
    // Decode and parse the data
    const conversationData = JSON.parse(decodeURIComponent(data));
    
    // Validate the API key
    const user = await validateApiKey(key);
    if (!user) {
      return res.status(401).send('Invalid API key');
    }
    
    // Create the conversation
    const conversation = await createConversation(user.id, conversationData);
    
    // Redirect to the conversation page
    res.redirect(`/conversations/${conversation.id}`);
  } catch (error) {
    console.error('Error handling extension request:', error);
    res.status(500).send('An error occurred while processing your request');
  }
});

/**
 * Example function to validate an API key
 * @param {string} apiKey - The API key to validate
 * @returns {Promise<Object|null>} - The user object if the key is valid, null otherwise
 */
async function validateApiKey(apiKey) {
  // Implementation would depend on your authentication system
  // This is just a placeholder
  return await db.users.findByApiKey(apiKey);
}

/**
 * Example function to create a conversation
 * @param {string} userId - The ID of the user creating the conversation
 * @param {Object} data - The conversation data
 * @returns {Promise<Object>} - The created conversation
 */
async function createConversation(userId, data) {
  // Implementation would depend on your conversation system
  // This is just a placeholder
  return await db.conversations.create({
    userId,
    initialUserMsg: data.initial_user_msg,
    repository: data.repository,
    createdAt: new Date()
  });
}