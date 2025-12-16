import { ChatOllama } from '@langchain/ollama';
import dotenv from 'dotenv';
import { createAgent, tool } from 'langchain';
import * as z from 'zod';

dotenv.config({ quiet: true });

const model = new ChatOllama({
  model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
  temperature: 0.1,
  maxRetries: 5,
});

const events = tool(
  ({ location }) => {
    if (location === 'Bratislava') {
      return `There is an outdoor cinema screening in Bratislava.`;
    }
    if (location === 'London') {
      return `There is a music festival happening in London.`;
    }
    if (location === 'New York') {
      return `There is a food fair taking place in New York.`;
    }
    return `Unable to get events for: ${location}.`;
  },
  {
    name: 'events',
    description: 'Get information about events',
    schema: z.object({
      location: z
        .string()
        .describe('The location to get event information for'),
    }),
  }
);

const addressBook = tool(
  ({ name }) => {
    const contacts: Record<string, string> = {
      Alice: 'Bratislava',
      Bob: 'London',
      John: 'New York',
    };
    return contacts[name] || `No contact found for: ${name}.`;
  },
  {
    name: 'addressBook',
    description: 'Get name of the city where a person lives',
    schema: z.object({
      name: z.string().describe('The name of the person to look up'),
    }),
  }
);

const agent = createAgent({
  model,
  tools: [addressBook, events],
  systemPrompt: `You are an intelligent agent that can use tools to answer user queries. Use only information from provided context. Answer factually and shortly, only with one sentence. Answer only what is asked.`, // Make sure to always use both tools when necessary to provide accurate answers. Use events tool only with valid location from addressBook tool.
});

const run = async () => {
  const response = await agent.invoke({
    messages: 'Where does Bob live?', // What are the events in the city where Alice lives?
  });
  console.log('Response:', response);
};

run();
