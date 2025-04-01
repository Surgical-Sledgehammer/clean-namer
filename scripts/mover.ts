#!/usr/bin/env ts-node

import fs from 'fs/promises';
import path from 'path';
import { existsSync, statSync } from 'fs';
import { logInfo, logError } from '../utils/logger';
import 'dotenv/config';

const VALID_EXTENSIONS = ['.mkv', '.mp4', '.avi', '.mov'];

async function main() {
    const [
        dirtyFolder,
        dirtyFile,
        cleanFolderName,
        cleanFileName,
    ] = process.argv.slice(2);

    if (!dirtyFolder || !dirtyFile || !cleanFolderName || !cleanFileName) {
        console.error("Usage: mover.ts <dirtyFolder> <dirtyFile> <cleanFolderName> <cleanFileName>");
        process.exit(1);
    }

    const baseSource = process.env.BASE_SOURCE_PATH || '';
    const baseDest = process.env.BASE_DESTINATION_PATH || '';

    if (!baseSource || !baseDest) {
        logError("BASE_SOURCE_PATH and BASE_DESTINATION_PATH must be set in the environment.");
        process.exit(1);
    }

    const sourceFolder = path.join(baseSource, dirtyFolder);
    const soureFilePath = path.join(sourceFolder, dirtyFile);
    const sourceExtention = path.extname(dirtyFile).toLowerCase();

    if (!VALID_EXTENSIONS.includes(sourceExtention)) {
        logError(`Invalid movie file extension: ${sourceExtention}`);
        process.exit(1);
    }

    const destinationFolder = path.join(baseDest, cleanFolderName);
    const destinationFilePath = path.join(destinationFolder, cleanFileName + sourceExtention);

    if (existsSync(destinationFilePath)) {
        logError(`File already exists at destination: ${destinationFilePath}`);
        process.exit(1);
    }

    try {
        await fs.mkdir(destinationFolder, { recursive: true });
        await fs.copyFile(soureFilePath, destinationFilePath);
        await fs.unlink(soureFilePath);
        logInfo(`Moved: ${soureFilePath} → ${destinationFilePath}`);

        const filesLeft = (await fs.readdir(sourceFolder)).length;
        if (filesLeft === 0) {
            await fs.rmdir(sourceFolder);
        } else {
            await fs.rm(sourceFolder, { recursive: true, force: true });
        }
        logInfo(`Cleaned up: ${dirtyFolder}`);
    } catch (err: any) {
        logError(`Failed to move file: ${err.message}`);
    }
}

main();
