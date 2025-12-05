import { createAgent, tool } from "langchain";
import { ChatOllama } from "@langchain/ollama";
import * as z from "zod";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatOllama({
  model: process.env.OLLAMA_MODEL || "llama3.1:8b",
  temperature: 0.7,
  maxRetries: 2,
})

const weather = tool(
  ({ location }) => `Results for: ${location}. Rainy, 22°C.`,
  {
    name: "weather",
    description: "Get weather information",
    schema: z.object({
      location: z.string().describe("The location to get weather information for"),
    }),
  }
);

const agent = createAgent({
  model,
  tools: [weather],
});

const run = async () => {
  const response = await agent.invoke({
    messages: "What is the weather currently in Bratislava?"
  });
  console.log("Response:", response);
}

run();