# AI Agent with LangGraph

## Overview
This project is a collection of two AI agents built using LangGraph, the LangChain framework for building AI agents. The agents are designed to interact with a user and perform tasks based on the provided instructions. The examples are limited to predefined custom tools, but it can be easily extended to handle more complex scenarios by adding your own tools to `./server/tools.ts` file.

The `./server` represents the backend connected to the `./client` which is a ReactJS frontend app that is used as the UI - minimalist chat-like interface -  to interact with the AI agent


Checkout the `./server/README.md`  and `./client/README.md` for more details on how to run the agent's UI and server.


## Server Stack
- Node.js
- TypeScript
- Express (as web server)
- Ollama as LLM local server
- Llama 3.2 as LLM to run locally
- LangChain (AI Framework to build agents from Langgraph)

## Client Stack
- React
- Node.js
- TypeScript
- Vite
- TailwindCSS
- Shadcn

