const url = require('url');
const http = require('http');
const https = require('https');

const inject = require('.');

const get = query => {
    const parsed = url.parse(query);
    let method;
    if (parsed.protocol === 'http:') {
        method = http;
    } else if (parsed.protocol === 'https:') {
        method = https;
    } else {
        throw new Error(`Unsupported protocol: '${parsed.protocol}'`);
    }

    return new Promise((resolve, reject) => {
        method.get(parsed, res => {
            let buffer = Buffer.alloc(0);

            res.on('error', err => reject(err));
            res.on('data', chunk => buffer = Buffer.concat([buffer, chunk]));
            res.on('end', () => resolve(buffer.toString()));
        });
    });
};


const print = text => {
    return console.log(text);
};

const log = inject(print).transform(0, text => '[INFO] ' + text);

print('hello world');
log('hello world');

// Yes, you can even inject inject itself.
const injectPromise = inject(inject).transformOutput(inject => Object.assign(inject, {
    // Add a method to the utility methods provided with inject()
    transformPromise: function (transformer) {
        return this.transformOutput(promise => promise.then(transformer));
    }
}));

const getJSON = injectPromise(get).transformPromise(JSON.parse);

getJSON('http://random.cat/meow').then(console.log);

const logFile = require('fs').createWriteStream(`./console-${Date.now()}.log`);

console.log = inject(console.log, console).before(args => logFile.write(`[LOG] ${args.join(' ')}\n`));

console.log('Hello world');
console.log('How are you?');