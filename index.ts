'use strict';

export function http(request, response) {
    console.log('Received request...');
    response.status(200).send('Hello World From Image Function using TypeScript new!');
}
