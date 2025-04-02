#!/usr/bin/env ts-node

import moveFile from "../utils/moveFile";

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

    moveFile(
        dirtyFolder,
        dirtyFile,
        cleanFolderName,
        cleanFileName,
    ).catch((err) => {
        console.error("Error moving file:", err);
        process.exit(1);
    }
    )
}

main();
