import { ChatOllama } from '@langchain/ollama';
import dotenv from 'dotenv';
import { createAgent, tool } from 'langchain';
import * as z from 'zod';

dotenv.config({ quiet: true });

const model = new ChatOllama({
  model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
  temperature: 0.7,
  maxRetries: 2,
});

const weather = tool(
  ({ location }) => {
    if (location === 'Bratislava') {
      return `Results for: ${location}. Sunny, 25°C.`;
    }
    if (location === 'London') {
      return `Results for: ${location}. Cloudy, 15°C.`;
    }
    if (location === 'New York') {
      return `Results for: ${location}. Windy, 20°C.`;
    }
    return `Unable to get weather for: ${location}.`;
  },
  {
    name: 'weather',
    description: 'Get weather information',
    schema: z.object({
      location: z
        .string()
        .describe('The location to get weather information for'),
    }),
  }
);

const agent = createAgent({
  model,
  tools: [weather],
});

const run = async () => {
  const response = await agent.invoke({
    messages: 'What is the weather currently in Bratislava?',
  });
  console.log('Response:', response);
};

run();
