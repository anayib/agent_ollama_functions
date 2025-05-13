import dotenv from "dotenv"
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama"
import { getCurrentWeatherTool, getLocationTool } from "./tools"
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";

dotenv.config()

// Define the tools for the agent to use
const tools = [getLocationTool, getCurrentWeatherTool];
const toolNode = new ToolNode(tools);

// Create a model and give it access to the tools
const model = new ChatOllama({
  baseUrl: process.env.OLLAMA_HOST || "http://localhost:11434",
  model: "llama3.2",
  temperature: 0,
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

// Define the system template
const SYSTEM_TEMPLATE = `
  You are a highly precise and resourceful assistant. Prioritize actionable, context-aware responses over generic advice. When possible, leverage available tools to gather real-time data or verify details before answering. Key principles:
  Specificity First – Avoid vague or broad answers. Tailor responses to the exact query, using provided context or researched data.
  Proactive Verification – Use tools (e.g., web search, code execution, document review) to confirm facts or fetch missing details. Example: "Let me check the latest documentation for you..."
  Structured Clarity – Break complex answers into steps, bullet points, or tables. Highlight critical info (e.g., "Note:" or "Warning:").
  Assume Intent – If a request is ambiguous, ask short, targeted follow-ups (e.g., "Should I prioritize speed or cost for this solution?").
  Own the Query – For unresolved issues, guide users to next steps (e.g., "I can't access X, but here's how to find it...").
  
  TOOL USAGE INSTRUCTIONS:
  - getLocation: Use this to find the user's current city.
  - getCurrentWeather: Use this to get weather information. If you want current location's weather, call this with empty cityName or set cityName to "current".
`;

// Example of running the agent with streaming
async function runAgentWithStreaming() {
  const stream = await app.stream({
    messages: [
      new SystemMessage(SYSTEM_TEMPLATE),
      new HumanMessage("Give me a list of activities to do in my current location and its weather"),
    ],
  }, {
    callbacks: [new ConsoleCallbackHandler()],
  });

  // Process the streaming response
  console.log("Streaming response:");
  for await (const chunk of stream) {
    if (chunk.messages?.length) {
      const lastMessage = chunk.messages[chunk.messages.length - 1];
      if (lastMessage.content) {
        // In a real UI, you would send this chunk to the frontend
        process.stdout.write(typeof lastMessage.content === 'string' ? lastMessage.content : JSON.stringify(lastMessage.content));
      }
    }
  }
  console.log("\nStreaming completed");
}

// Run with streaming
runAgentWithStreaming();

// Standard non-streaming execution (kept for reference)
// const finalState = await app.invoke({
//   messages: [
//     new SystemMessage(SYSTEM_TEMPLATE),
//     new HumanMessage("Give me a list of activities to do in my current location and its weather"),
//   ],
// });
// console.log(finalState.messages[finalState.messages.length - 1].content);

// const nextState = await app.invoke({
//   // Including the messages from the previous run gives the LLM context.
//   // This way it knows we're asking about the weather in NY
//   messages: [...finalState.messages, new HumanMessage("what about ny")],
// });
// console.log(nextState.messages[nextState.messages.length - 1].content);