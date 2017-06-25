const express = require('express');
const cons = require('consolidate');
const app = express();
const fs = require('fs');
const crypto = require('crypto');
const redis = require('redis');

app.engine('html', cons.handlebars);

app.set('views', __dirname + '/views');
app.set('view engine', 'html');

var redisClient = redis.createClient({
    host: 'localhost'
});

app.get('/', (req, res) => {
    var id = crypto.randomBytes(16).toString('hex');
    redisClient.hset('hashes', [ id, "img.png" ], (err, repl) => {
        if(!err){
            res.render('index', { hash: id });
        }
        else{
            console.log(err);
        }
    });
});

app.get('/img.png', (req, res) => {
    var sentHash = req.query.hash || '';
    redisClient.hget('hashes', sentHash, (err, repl) => {
        if(!err){
            if(repl == 'img.png'){
                redisClient.hdel('hashes', sentHash);
                fs.readFile('./img/img.png', (err, buff) => {
                    res.setHeader("Content-Type", "image/png");
                    res.writeHead(200);
                    res.end(buff);
                });
            }
            else{
                res.writeHead(404);
                res.end('Not Found!');
            }
        }
        else{
            console.log(err);
        }
    });
});

app.listen(3000, () => {
    console.log('App Running!');
});
