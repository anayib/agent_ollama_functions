# AI Agent with LangGraph

## Overview
This project show-cases how to build AI agents that interact with tools (functions/APIs) and locally-run LLMs via Ollama.

Built with LangGraph and LangChain, it includes two AI agents that perform tasks based on user instructions. The current implementation uses predefined tools (getLocationTool and getCurrentWeatherTool), but you can easily extend it by adding custom tools in ./server/tools.ts.

Project Structure
`./server`: Backend (LangChain/LangGraph agents, tool logic)

`./client`: Frontend (React.js chat interface for interacting with the agents)

The system is designed to be flexible and can be used with any LLM installed locally via Ollama, integrate new tools like third party APIs or custom functions you define, or customize the UI as needed (you can currently use it via CLI or GUI).


Checkout the `./server/README.md`  and `./client/README.md` for more details on how to run the agent's UI and server.


## Server Stack
- Node.js
- TypeScript
- Express (as web server)
- Ollama as LLM local server
- Llama 3.2 as LLM to run locally
- LangGraph (AI Framework to build agents from LangChain)

## Client Stack
- React
- Node.js
- TypeScript
- Vite
- TailwindCSS
- Shadcn

