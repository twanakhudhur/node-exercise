const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

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
        return `Message written to ${filePath}`;
    } catch (error) {
        throw new Error(`Error writing message: ${error}`);
    }
}

async function deleteFileByName(filePath) {
    try {
        await fs.promises.access(filePath);
        await fs.promises.unlink(filePath);
        return `File ${filePath} deleted successfully`;
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`File not found: ${filePath}`);
        } else {
            throw new Error(`Error deleting file: ${error}`);
        }
    }
}

async function readFileContent(filePath) {
    try {
        const content = await fs.promises.readFile(filePath, 'utf8');
        return content;
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`File not found: ${filePath}`);
        } else {
            throw new Error(`Error reading file: ${error}`);
        }
    }
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    if (pathname.startsWith('/files/')) {
        const fileName = pathname.substring('/files/'.length);
        const filePath = path.join(__dirname, fileName);

        if (method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString(); 
            });
            req.on('end', async () => {
                try {
                    const message = body;
                    const result = await createFileWithMessage(message);
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end(result);
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end(error.message);
                }
            });
        } else if (method === 'DELETE') {
            try {
                await deleteFileByName(filePath);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(`File ${filePath} deleted successfully`);
            } catch (error) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(error.message);
            }
        } else if (method === 'GET') {
            try {
                const content = await readFileContent(filePath);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(content);
            } catch (error) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(error.message);
            }
        } else {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method Not Allowed');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
