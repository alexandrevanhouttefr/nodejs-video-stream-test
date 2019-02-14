const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.set('port', process.env.PORT || 3001);
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function(req, res) {
    res.sendFile('index.html', {
        root: path.join(__dirname, 'views'),
    })
});

app.get('/video', function(req, res) {
    const path='assets/test1.mp4';
    fs.stat(path, function(error, stat) {
        if (error && error.code === 'ENOENT') {
            return res.sendStatus(404);
        }
        const fileSize = stat.size;
        const range = req.headers.range;

        if (!range) {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            fs.createReadStream(path).pipe(res);
        } else {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = (end-start) + 1;
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(206, head);
            const file = fs.createReadStream(path, {start, end})
                .on("open", function () {
                    file.pipe(res);
                }).on("error", function(error) {
                    res.end(error);
                });
        }
    });
});

app .listen(app.get('port'), function(){
    console.log( 'Server is listening on port ' + app.get('port'));
} );