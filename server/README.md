# AI Agent with LanGraph

## Overview
This project is a collection of two AI agents built using LangGraph, the LangChain framework for building AI agents. The agents are designed to interact with a user and perform tasks based on the provided instructions. The examples are limited to predefined custom tools, but it can be easily extended to handle more complex scenarios by adding your own tools to `./server/tools.ts` file.

The `./server` represents the backend connected to the `./client` which is a ReactJS frontend app that is used as the UI - minimalist chat-like interface -  to interact with the AI agent

In the `./server` folder there are two examples of agents:

- `agentquestion.ts` - a simple agent that uses tools to answer questions
- `agentconversations.ts` - a more complex agent that uses tools to answer questions and maintain conversation history. You can use your CLI to run and interact with the agent. 

Aditionally , you find in `./server/server.ts` the implementation of a Expressjs server that connects the `agentconversations.ts` agent with the front end in `client` folder which is a ReactJS frontend app that is used as a chat UI. 

The porpuse of this project is to show-case how to build AI agents that interact with external tools - other APIs or functions -, track conversation history and use a local LLM to generate responses. 

## Stack:
- Node.js
- TypeScript
- Express (as web server)
- Ollama as LLM local server
- Llama 3.2 as LLM to run locally
- LangGraph (AI Framework to build agents from Langchain)

## agentquestion.ts

The `agentquestion.ts` is a simple agent that uses tools to answer questions. Let me walk you through the key components:

The code sets up a simple agent that:

- Uses the Llama 3.2 model via Ollama
- Can use tools to get real-time information (location and weather) 

You can replace the user prompt with any question you want to ask the agent by typing your question straight into the file and running `npm run agentquestion`.

## agentconversations.ts

Upgrade to the previous agent by adding a CLI to interact with the agent. 

The `agentconversations.ts` is a conversational agent using LangChain, Ollama, and the Llama 3.2 model. This system can have conversations with users while utilizing tools for getting location and weather information. Let me walk you through the key components:

The code sets up a sophisticated conversational agent that:

- Uses the Llama 3.2 model via Ollama
- Can use tools to get real-time information (location and weather)
- Maintains conversation history
- Provides streaming responses
- Runs as a command-line application by running `npm run agentconversations`.

The architecture uses LangChain's StateGraph to create a workflow where:

- The agent processes user messages
- It can choose to use tools when needed
- Tool results feed back into the conversation
- The process repeats until a final answer is given

The code includes conversation management functions to create, retrieve, and clean up conversations, as well as a detailed system prompt that guides the assistant's behavior .

**You can run this agent in two ways**:

- Interacting with the agent through the **CLI** by running `npm run agentconversations`.
- Interacting with the agent through the **web interface** by running `npm run dev`.

## Running the server.ts and the client

Run `npm run dev` to start the server. The server will run on port 3001 by default. You will need to also run the React app client in the `./client` folder by running `npm run dev` in the `./client` folder so that the server and the client are running at the same time.


Notes: 

- Take into account that the `getLocation()` tool is mocked due to API limits. You can uncomment/comment the code to use the real API.
- This **is not a production ready implementation**. The server.ts implements  a simple in memory storage for the conversation history using a Map data strcuture. 

Keep tuned to the repo to see how to implement a production ready implementation using user sesiions and persistent storage usign PostgreSQL and DrizzleORM.