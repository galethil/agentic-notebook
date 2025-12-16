import { ChatOllama } from '@langchain/ollama';
import dotenv from 'dotenv';
import { createAgent, HumanMessage } from 'langchain';

dotenv.config({ quiet: true });

const model = new ChatOllama({
  model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
  temperature: 0.7,
  maxRetries: 2,
});

const agent = createAgent({
  model,
  tools: [],
});

while (true) {
  const userInput = await new Promise<string>(resolve => {
    process.stdout.write('User: ');
    process.stdin.once('data', data => resolve(data.toString().trim()));
  });

  const response = await agent.invoke({
    messages: new HumanMessage(userInput),
  });
  console.log(
    'Agent: ',
    response.messages[response.messages.length - 1].content
  );
}
