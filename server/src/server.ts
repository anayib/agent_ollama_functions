import express from 'express';
import cors from 'cors';
import { createConversation, continueConversation } from './agentconversations';

const app = express();
app.use(cors());
app.use(express.json());

// Store active conversations
const activeConversations = new Map<string, string>();

// Create a new conversation
app.post('/api/conversation/create', (req, res) => {
  try {
    const conversationId = createConversation();
    res.json({ conversationId });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Send message to agent
app.post('/api/conversation/message', async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    
    if (!conversationId || !message) {
      return res.status(400).json({ error: 'Missing conversationId or message' });
    }

    const response = await continueConversation(conversationId, message);
    res.json(response);
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});