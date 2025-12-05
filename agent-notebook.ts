import { AIMessage, createAgent, HumanMessage, tool, ToolMessage } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import * as z from "zod";
import dotenv from "dotenv";
import fs from "fs";
import notesStructure from "./notes/notesStructure";


dotenv.config({quiet: true});

const model = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0.1,
  maxTokens: 1000,
  timeout: 3000,
});

const listNoteFolders = tool(
  () => {
    return JSON.stringify(notesStructure);
  },
  {
    name: "listNoteFolders",
    description: "List the folders where notes are stored.",
    schema: z.object({}),
  }
);

const saveToProcessNote = tool(
  ({ fileName, folderPath, markdownText }) => {
    console.log(`Trying to save note to ./notes/${folderPath}/${fileName}.md`);

    if (!fs.existsSync(`./notes/${folderPath}`)) {
      return `Folder path does not exist: ./notes/${folderPath}`;
    }
    const filePath = `./notes/${folderPath}/${fileName}.md`;
    fs.appendFileSync(filePath, markdownText, 'utf8');
    return `Note saved to ${filePath}`;
  },
  {
    name: "saveToProcessNote",
    description: "Save a note to the process output",
    schema: z.object({
      fileName: z.string().describe("The name of the file to save the note to. E.g. `meeting_notes_2023_09_15`, `project_ideas` or `shopping_list`, without the .md extension."),
      folderPath: z.string().describe("The path of the folder to save the note in. Use the folder structure from listNoteFolders tool."),
      markdownText: z.string().describe("The markdown text of the note to save."),
    }),
  }
);

const getAllNotesFromFolder = tool(
  ({ folderPath }) => {
    if (!fs.existsSync(`./notes/${folderPath}`)) {
      return `Folder path does not exist: ./notes/${folderPath}`;
    }
    const files = fs.readdirSync(`./notes/${folderPath}`);
    let allText = '';
    for (const file of files) {
      const filePath = `./notes/${folderPath}/${file}`;
      const content = fs.readFileSync(filePath, 'utf8');
      allText += `\n\n# File: ${file}\n\n${content}`;
    }
    return allText;
  },
  {
    name: "getAllNotesFromFolder",
    description: "Get information about any topic from all notes in a folder",
    schema: z.object({
      folderPath: z.string().describe("The path of the folder to read the content from. Use the folder structure from listNoteFolders tool."),
    }),
  }
);


const agent = createAgent({
  model,
  tools: [listNoteFolders, saveToProcessNote, getAllNotesFromFolder],
  systemPrompt: `You are an intelligent agent. Always use tools to read and write notes. When answering a question always use \`getAllNotesFromFolder\` tool to get information from the notes. Use only information from the notes when answering questions. Do not make up any other information and do not use your training data knowledge. Do not use general knowledge. When writing notes, always use markdown format.`,
});


type Message = HumanMessage | AIMessage | ToolMessage;
let messages: Message[] = [];

while (true) {
  const userInput = await new Promise<string>((resolve) => {
    process.stdout.write("User: ");
    process.stdin.once("data", (data) => resolve(data.toString().trim()));
  });

  if (userInput.toLowerCase() === "exit" || userInput.toLowerCase() === "quit") {
    console.log("Exiting...");
    console.log("Final conversation history:", messages);
    process.exit(0);
  }

  messages.push(new HumanMessage(userInput));

  const response = await agent.invoke({ messages });
  console.log("Agent: ", response.messages[response.messages.length - 1].content);

  messages = response.messages as Message[];
}
