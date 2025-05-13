# LangChain Agent with Ollama/Llama - Line-by-Line Explanation

## Import Statements

```javascript
import dotenv from "dotenv"
```
Imports the dotenv library to load environment variables from a .env file.

```javascript
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
```
Imports message types from LangChain to structure conversation history.

```javascript
import { ToolNode } from "@langchain/langgraph/prebuilt";
```
Imports ToolNode from LangChain, which is used to create nodes in a graph that can execute tools.

```javascript
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
```
Imports StateGraph (for creating a workflow graph) and MessagesAnnotation (for tracking message state).

```javascript
import { ChatOllama } from "@langchain/ollama"
```
Imports the ChatOllama class to interact with the Ollama API.

```javascript
import { getCurrentWeatherTool, getLocationTool } from "./tools"
```
Imports two tools defined elsewhere: one for getting the current weather and another for getting location.

```javascript
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";
```
Imports a callback handler for logging to the console.

```javascript
import readline from 'readline';
```
Imports Node.js readline module for command-line interaction.

## Setting Up the Environment and Tools

```javascript
dotenv.config()
```
Loads environment variables from .env file.

```javascript
const tools = [getLocationTool, getCurrentWeatherTool];
```
Creates an array containing the two imported tools.

```javascript
const toolNode = new ToolNode(tools);
```
Creates a node that can execute these tools in the workflow graph.

## Setting Up the Model

```javascript
const model = new ChatOllama({
  baseUrl: process.env.OLLAMA_HOST || "http://localhost:11434",
  model: "llama3.2",
  temperature: 0.4,
  streaming: true, // Enable streaming
}).bindTools(tools);
```
Creates a ChatOllama instance:
- Uses a base URL from environment variables or defaults to localhost
- Specifies the model as "llama3.2"
- Sets temperature to 0.4 (lower = more deterministic responses)
- Enables streaming for real-time response generation
- Binds the tools to the model so it can use them

## Defining the Workflow Logic

```javascript
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  // Otherwise, we stop (reply to the user) using the special "__end__" node
  return "__end__";
}
```
Defines a function that decides whether to continue with tool execution:
- Examines the last message in the conversation
- If the AI has requested to use tools, routes to the "tools" node
- Otherwise, ends the workflow and returns the response

```javascript
async function callModel(state: typeof MessagesAnnotation.State) {
  const response = await model.invoke(state.messages);

  // We return a list, because this will get added to the existing list
  return { messages: [response] };
}
```
Defines a function that calls the LLM:
- Takes the current state containing messages
- Invokes the model with these messages
- Returns the AI's response to be added to the conversation

## Building the Workflow Graph

```javascript
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);
```
Creates a workflow graph:
- Initializes with MessagesAnnotation to track state
- Adds an "agent" node that calls the model
- Sets "agent" as the starting point
- Adds a "tools" node for executing tools
- Creates an edge from "tools" back to "agent"
- Adds conditional edges from "agent" based on the shouldContinue function

```javascript
const app = workflow.compile();
```
Compiles the workflow graph into a runnable application.

## Conversation Management

```javascript
interface ConversationHistory {
  id: string;
  messages: (HumanMessage | AIMessage | SystemMessage)[];
}
```
Defines a TypeScript interface for conversation history.

```javascript
const activeConversations = new Map<string, ConversationHistory>();
```
Creates a Map to store active conversations.

```javascript
export function createConversation(): string {
  const conversationId = Date.now().toString();
  activeConversations.set(conversationId, {
    id: conversationId,
    messages: [new SystemMessage(SYSTEM_TEMPLATE)]
  });
  return conversationId;
}
```
Function to create a new conversation:
- Generates a unique ID based on the current timestamp
- Initializes the conversation with a system message
- Returns the conversation ID

```javascript
export function getConversationHistory(conversationId: string): ConversationHistory | undefined {
  return activeConversations.get(conversationId);
}
```
Function to retrieve a conversation by ID.

## Handling Conversations

```javascript
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
```
Function to continue an existing conversation:
- Retrieves the conversation by ID
- Adds the user's message to the history
- Streams the agent's response
- Processes each chunk of the response
- Handles different content types (string or object)
- Adds the agent's messages to the conversation history
- Returns the final response and updated history

```javascript
export function cleanupOldConversations(maxAgeMs: number = 24 * 60 * 60 * 1000) {
  const now = Date.now();
  for (const [id] of activeConversations) {
    if (parseInt(id) < now - maxAgeMs) {
      activeConversations.delete(id);
    }
  }
}
```
Function to clean up old conversations:
- Takes a maximum age in milliseconds (defaults to 24 hours)
- Deletes conversations older than the specified age

## System Template and Command Line Interface

```javascript
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
```
Defines the system instructions for the AI:
- Sets the assistant's personality and behavior
- Describes principles for response generation
- Provides instructions for using the available tools

```javascript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
```
Creates a readline interface for command-line interaction.

```javascript
function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}
```
Promisifies the readline question method for easier use with async/await.

## Running the Application

```javascript
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
```
Function to run the agent:
- Creates a new conversation
- Enters a loop to continually get user input
- Processes each input and displays the response
- Shows conversation history length
- Exits when the user types 'exit'
- Includes error handling and resource cleanup

```javascript
runAgentWithStreaming();
```
Calls the function to start the application.