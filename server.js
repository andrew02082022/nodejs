const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;


const logEvents = require('./logEvents');
const EventEmitter = require('events');
const {raw} = require("http2");

class MyEmitter extends EventEmitter {
}


const myEmitter = new MyEmitter();
myEmitter.on('log', (msg, fileName) => logEvents(msg, fileName));

const PORT = process.env.PORT || 3500;

const serveFile = async (filePath, contentType, response) => {
    try {
        const rawData = await fsPromises.readFile(
            filePath,
            !contentType.includes('image') ? 'utf8' : ''
        );
        const data = contentType === 'application/json' ? JSON.parse(rawData) : rawData;
        response.writeHead(
            filePath.includes('404.html') ? 404 : 200,
            {'Content-Type': contentType}
        );
        response.end(contentType === 'application/json' ? JSON.stringify(data) : data);
    } catch (err) {
        console.log(err);
        myEmitter.emit('log', `${err.name}\t${err.message}`, 'errLog.txt');
        response.statusCode = 500;
        response.end();
    }
}

const server = http.createServer((req, res) => {
    console.log(req.url, req.method);
    myEmitter.emit('log', `${req.url}\t${req.method}`, 'reqLog.txt');

    const extension = req.url === '/'? '.html': path.extname(req.url);
    let contentType;
    let filePath;
    switch (extension) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        default:
            contentType = 'text/html';
            break;
    }

    switch (extension) {
        case '.html':
            if (req.url === '/')
                filePath = path.join(__dirname, 'views', 'index.html');
            else if (req.url.slice(-1) === '/')
                filePath = path.join(__dirname, 'views', req.url, 'index.html');
            else
                filePath = path.join(__dirname, 'views', req.url);
            break;
        default:
            filePath = path.join(__dirname, req.url);
    }
    if (!extension && req.url.slice(-1) === '/') filePath += ".html";

    const fileExists = fs.existsSync(filePath);

    if (fileExists) {
        serveFile(filePath, contentType, res);
    } else {
        switch (path.parse(filePath).base) {
            case 'old-page.html':
                res.writeHead(301, {'Location': '/new-page.html'});
                res.end();
                break;
            case 'www-page.html':
                res.writeHead(301, {'Location': '/'});
                res.end();
                break;
            default:
                serveFile(path.join(__dirname, 'views', '404.html'), 'text/html', res);
        }
    }

});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

