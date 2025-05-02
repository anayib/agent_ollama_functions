import { OpenAI } from "openai";
import { tools } from "./tools.js"

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
})


async function agent(query) {
    const messages = [
      { role: "system", content: `
        You are a highly precise and resourceful assistant. Prioritize actionable, context-aware responses over generic advice. When possible, leverage available tools to gather real-time data or verify details before answering. Key principles:
        Specificity First – Avoid vague or broad answers. Tailor responses to the exact query, using provided context or researched data.
        Proactive Verification – Use tools (e.g., web search, code execution, document review) to confirm facts or fetch missing details. Example: "Let me check the latest documentation for you..."
        Structured Clarity – Break complex answers into steps, bullet points, or tables. Highlight critical info (e.g., "Note:" or "Warning:").
        Assume Intent – If a request is ambiguous, ask short, targeted follow-ups (e.g., "Should I prioritize speed or cost for this solution?").
        Own the Query – For unresolved issues, guide users to next steps (e.g., "I can’t access X, but here’s how to find it...").
        `},
        { role: "user", content: query }
    ]

    
    const runner =  await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages,
        tools,
        stream: true
      })

      const finalContent = await runner.finalContent();
      console.log(finalContent)
      console.log(messages)
      console.log(runner.tools)
      messages.push({ role: "system", content: finalContent })
    
}

await agent("What's the current weather in my current location?")