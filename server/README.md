# AI Agent with LanGraph

## Overview
This project is compilation of three AI agents built using LangGraph, a framework for building AI agents using Langchain. The agents are designed to interact with a user and perform tasks based on the provided instructions. The examples are limited to predefined tasks, but it can be easily extended to handle more complex scenarios.

The `./server` represents the backend connected to the `./client` which is a ReactJS frontend app that is used as the UI - minimalist chat-like interface -  to interact with the AI agent

In the `./server` folder there are three agents that are examples of agents:

- `agentquestion.ts` - a simple agent that uses tools to answer questions
- `agentconversations.ts` - a more complex agent that uses tools to answer questions and maintain conversation history. Use your CLI to run and interact with the agent.
- `server.ts` - a more complex agent that uses tools to answer questions and maintain conversation history. It is connected to the `./client` folder which is a ReactJS frontend app that is used as the UI - minimalist chat-like interface -  to interact with the AI agent

The porpuse of this project is to show how to build AI agents using LangGraph and Langchain in typescript from a simple question-answer interaction, to a complete solution with a web interface and conversation history. 

## Stack:
- Node.js
- TypeScript
- Express (as web server)
- Redis to track chat history (cache data base)
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


Note: Take into account that the `getLocation()` tool is mocked due to API limits. You can uncomment/comment the code to use the real API.