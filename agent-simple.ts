import { createAgent } from "langchain";
import { ChatOllama } from "@langchain/ollama";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatOllama({
  model: process.env.OLLAMA_MODEL || "llama3.1:8b",
  temperature: 0.7,
  maxRetries: 2,
})

const agent = createAgent({
  model,
});

const run = async () => {
  const response = await agent.invoke({
    messages: "What is the the capital of France?"
  });
  console.log("Response:", response);
}

run();