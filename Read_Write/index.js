const fs = require('fs');
const path = require('path');

async function createFileWithMessage(message) {
    const now = new Date();

    const date = now.toISOString().split('T')[0]; 
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); 
    
    const directory = path.join(__dirname, date);
    const fileName = `${time}.txt`;
    const filePath = path.join(directory, fileName);

    try {
        await fs.promises.mkdir(directory, { recursive: true });
        
        await fs.promises.appendFile(filePath, message + '\n');
        console.log(`Message written to ${filePath}`);
    } catch (error) {
        console.error(`Error writing message: ${error}`);
    }
}

async function deleteFileByName(filePath) {
    try {
        await fs.promises.access(filePath);
        
        await fs.promises.unlink(filePath);
        console.log(`File ${filePath} deleted successfully`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`File not found: ${filePath}`);
        } else {
            console.error(`Error deleting file: ${error}`);
        }
    }
}

async function removeDirectoryRecursive(directoryPath) {
    try {
        const files = await fs.promises.readdir(directoryPath);
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const stat = await fs.promises.stat(filePath);
            if (stat.isDirectory()) {
                await removeDirectoryRecursive(filePath);
            } else {
                await fs.promises.unlink(filePath);
            }
        }
        await fs.promises.rmdir(directoryPath);
        console.log(`Directory ${directoryPath} removed successfully`);
    } catch (error) {
        console.error(`Error removing directory: ${error}`);
    }
}

if (process.argv[2] === 'create') {
    const message = process.argv[3];
    if (!message) {
        console.log("Please provide a message to write.");
    } else {
        createFileWithMessage(message);
    }
}

if (process.argv[2] === 'delete') {
    const filePath = process.argv[3];
    if (!filePath) {
        console.log("Please provide a file path to delete.");
    } else {
        deleteFileByName(filePath);
    }
}

if (process.argv[2] === 'remove-directory') {
    const directoryPath = process.argv[3];
    if (!directoryPath) {
        console.log("Please provide a directory path to remove.");
    } else {
        removeDirectoryRecursive(directoryPath);
    }
}
