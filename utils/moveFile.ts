import fs from 'fs/promises';
import path from 'path';
import { existsSync, statSync } from 'fs';
import { logInfo, logError } from '../utils/logger';
const VALID_EXTENSIONS = ['.mkv', '.mp4', '.avi', '.mov'];
import 'dotenv/config';

const moveFile = async (
    dirtyFolder: string,
    dirtyFile: string,
    cleanFolderName: string,
    cleanFileName: string
) => {

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

export default moveFile;