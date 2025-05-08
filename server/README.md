# AI Agent with LanGraph

## Overview
This project is an AI agent built using LangGraph, a framework for building AI agents using Langchain. The agent is designed to interact with a user and perform tasks based on the provided instructions. The example is limited to predefined tasks, but it can be easily extended to handle more complex scenarios.

The `./server` represents the backend connected to the `./client` which is a ReactJS frontend app that is used as the UI - minimalist chat-like interface -  to interact with the AI agent

Stack:
- Node.js
- TypeScript
- Express (as web server)
- Redis to track chat history (cache data base)
- Ollama as LLM local server
- Lama as LLM to ran locally
- LangGraph (AI Framework to build agents from Langchain)