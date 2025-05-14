import dotenv from "dotenv"
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama"
import { getCurrentWeatherTool, getLocationTool } from "./tools"
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";
import readline from 'readline';

dotenv.config()

// Define the tools for the agent to use
const tools = [getLocationTool, getCurrentWeatherTool];
const toolNode = new ToolNode(tools);

// Create a model and give it access to the tools
const model = new ChatOllama({
  baseUrl: process.env.OLLAMA_HOST || "http://localhost:11434",
  model: process.env.OLLAMA_MODEL_NAME || "qwen3",
  temperature: 0.4,
  streaming: true, // Enable streaming
}).bindTools(tools);

// Define the function that determines whether to continue or not
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  // Otherwise, we stop (reply to the user) using the special "__end__" node
  return "__end__";
}

// Define the function that calls the model
async function callModel(state: typeof MessagesAnnotation.State) {
  const response = await model.invoke(state.messages);

  // We return a list, because this will get added to the existing list
  return { messages: [response] };
}

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);

// Finally, we compile it into a LangChain Runnable.
const app = workflow.compile();

// Conversation history type
interface ConversationHistory {
  id: string;
  messages: (HumanMessage | AIMessage | SystemMessage)[];
}

// Store active conversations
const activeConversations = new Map<string, ConversationHistory>();

// Create a new conversation
export function createConversation(): string {
  const conversationId = Date.now().toString();
  activeConversations.set(conversationId, {
    id: conversationId,
    messages: [new SystemMessage(SYSTEM_TEMPLATE)]
  });
  return conversationId;
}

// Get conversation history
export function getConversationHistory(conversationId: string): ConversationHistory | undefined {
  return activeConversations.get(conversationId);
}

// Add user message and get agent response
export async function continueConversation(conversationId: string, userMessage: string) {
  const conversation = activeConversations.get(conversationId);
  if (!conversation) {
    throw new Error(`Conversation ${conversationId} not found`);
  }

  // Add user message to history
  conversation.messages.push(new HumanMessage(userMessage));

  // Get agent response with streaming
  const stream = await app.stream({
    messages: conversation.messages,
  }, {
    callbacks: [new ConsoleCallbackHandler()],
  });

  // Process and return the streaming response
  const chunks: string[] = [];
  for await (const chunk of stream) {
    // Check for agent messages in the chunk
    if (chunk.agent?.messages?.length) {
      const lastMessage = chunk.agent.messages[chunk.agent.messages.length - 1];
      
      if (lastMessage.content) {
        let content = '';
        if (typeof lastMessage.content === 'string') {
          content = lastMessage.content;
        } else if (typeof lastMessage.content === 'object') {
          content = JSON.stringify(lastMessage.content);
        }
        
        if (content.trim()) {
          chunks.push(content);
        }
      }
      
      // Add agent's message to conversation history
      conversation.messages.push(lastMessage);
    }
  }
  
  const finalResponse = chunks.join(' ');

  return {
    response: finalResponse,
    history: conversation.messages
  };
}

// Clean up old conversations (optional, implement based on your needs)
export function cleanupOldConversations(maxAgeMs: number = 24 * 60 * 60 * 1000) {
  const now = Date.now();
  for (const [id] of activeConversations) {
    if (parseInt(id) < now - maxAgeMs) {
      activeConversations.delete(id);
    }
  }
}

// Define the system template
const SYSTEM_TEMPLATE = `
  You are a highly precise and resourceful assistant. Prioritize actionable, context-aware responses over generic advice. When possible, leverage available tools to gather real-time data or verify details before answering. Key principles:
  Specificity First – Avoid vague or broad answers. Tailor responses to the exact query, using provided context or researched data.
  Proactive Verification – Use tools (e.g., web search, code execution, document review, getLocationTool, getCurrentWeatherTool,) to confirm facts or fetch missing details. Example: "Let me check the latest documentation for you..."
  Structured Clarity – Break complex answers into steps, bullet points, or tables. Highlight critical info (e.g., "Note:" or "Warning:").
  Assume Intent – If a request is ambiguous, ask short, targeted follow-ups (e.g., "Should I prioritize speed or cost for this solution?").
  Own the Query – For unresolved issues, guide users to next steps (e.g., "I can't access X, but here's how to find it...").
  
  TOOL USAGE INSTRUCTIONS:
  - getLocation: Use this to find the user's current city.
  - getCurrentWeather: Use this to get weather information. If you want current location's weather, call this with empty cityName or set cityName to "current".
`;

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

// Example of running the agent with streaming
async function runAgentWithStreaming() {
  try {
    const conversationId = createConversation();
    
    while (true) {
      // Get user input
      const userInput = await askQuestion("\nHow can I help you today? (type 'exit' to quit): ");
      
      if (userInput.toLowerCase() === 'exit') {
        console.log("Conversation ended.");
        break;
      }

      console.log("\nProcessing your question...");
      const { response, history } = await continueConversation(conversationId, userInput);
      
      console.log("\nAgent Response:");
      console.log(response);
      
      console.log("\nConversation history length:", history.length, "messages");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    rl.close();
  }
}

// Run with streaming
runAgentWithStreaming();