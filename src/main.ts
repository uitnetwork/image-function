'use strict';
import { Request, Response } from 'express';
import * as Storage from '@google-cloud/storage';

export function http(request: Request, response: Response) {

    console.log(`Base URL is: ${request.baseUrl}`);
    let googleStorage = Storage({
        projectId: 'testProjectId'
    });
    googleStorage.createBucket('testBucket')
        .then(() => console.log(`Bucket Created`))
        .catch(err => console.log(err));
    response.status(200).send('Hello World From Image Function using TypeScript!');
}
