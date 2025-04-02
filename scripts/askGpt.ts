#!/usr/bin/env ts-node

import fs from 'fs/promises';
import path from 'path';
import { OpenAI } from 'openai';
import 'dotenv/config';
import moveFile from '../utils/moveFile';
import { logInfo, logError } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BASE_SOURCE_PATH = process.env.BASE_SOURCE_PATH!;
if (!BASE_SOURCE_PATH) {
  throw new Error('Missing BASE_SOURCE_PATH in environment');
}

async function getNextFolderAndContents() {
  const folders = (await fs.readdir(BASE_SOURCE_PATH, { withFileTypes: true }))
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  const firstFolder = folders[0];
  const fullPath = path.join(BASE_SOURCE_PATH, firstFolder);
  const files = await fs.readdir(fullPath);

  return { firstFolder, files };
}

async function getMoveArgsFromGPT(dirtyFolderName: string, files: string[]) {
  const prompt = `You are helping clean and organize movie files for a media server.

Given this folder name:
"${dirtyFolderName}"

And the following files inside:
${files.map(f => `- ${f}`).join('\n')}

What are the correct 4 arguments for this command:

ts-node scripts/mover.ts <dirtyFolderName> <dirtyFileName> <cleanFolderName> <cleanFileNameNoExtension>

Return them as a JSON array like:
["<dirtyFolderName>", "<dirtyFileName>", "<cleanFolderName>", "<cleanFileNameNoExtension>"]`;

  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful assistant for organizing movie files.' },
      { role: 'user', content: prompt },
    ],
  });

  const text = chatCompletion.choices[0].message.content || '';
  const match = text.match(/\[.*\]/s);
  if (!match) throw new Error(`Could not extract JSON array from GPT response: ${text}`);

  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed) || parsed.length !== 4) {
    throw new Error(`Unexpected GPT format: ${JSON.stringify(parsed)}`);
  }

  return {
    dirtyFolderName: parsed[0],
    dirtyFileName: parsed[1],
    cleanFolderName: parsed[2],
    cleanFileNameNoExtension: parsed[3],
  };
}

async function main() {
  try {
    const { firstFolder, files } = await getNextFolderAndContents();
    logInfo(`Scanning folder: ${firstFolder}`);

    const args = await getMoveArgsFromGPT(firstFolder, files);
    logInfo(`GPT decided on args:\n${JSON.stringify(args, null, 2)}`);

    await moveFile(args.dirtyFolderName, args.dirtyFileName, args.cleanFolderName, args.cleanFileNameNoExtension);
  } catch (err: any) {
    logError(`askGpt.ts failed: ${err.message}`);
  }
}

main();
