'use strict';
import { Request, Response } from 'express';
import { StorageEvent } from './storage-event';
import { ImageService } from './image-service';
import { FileService } from './file-service';
import * as Storage from '@google-cloud/storage';
import { StorageService } from './storage-service';
import * as gm from 'gm';

// TODO: inject service (eg: Awilix)
let googleStorage: any = Storage();
let fileService: FileService = new FileService();
let storageService: StorageService = new StorageService(googleStorage, fileService);
let imageMagick = gm.subClass({imageMagick: true});
let imageService = new ImageService(imageMagick, storageService, fileService);

export function http(request: Request, response: Response) {
    switch (request.method) {
        case 'GET':
            handleGet(request, response);
            break;
        case 'POST':
            handlePost(request, response);
            break;
        case 'PUT':
            handlePut(request, response);
            break;
        default:
            handleUnknown(request, response);
    }
}

function handleGet(request: Request, response: Response) {
    console.log(`GET: ${request.originalUrl}`);
    response.status(200).send('Hello World From Image Function using TypeScript!');
}

function handlePost(request: Request, response: Response) {
    response.status(200).send('Created!');
}

function handlePut(request: Request, response: Response) {
    response.status(501).send(`Function does not support method: ${request.method}.`);
}

function handleUnknown(request: Request, response: Response) {
    response.status(501).send(`Function does not support method: ${request.method}.`);
}

export function image(storageEvent: StorageEvent, callback) {
    console.log('Received event: ' + JSON.stringify(storageEvent));

    let bucket = storageEvent.data.bucket;
    let name = storageEvent.data.name;
    let contentType = storageEvent.data.contentType;
    let resourceState = storageEvent.data.resourceState;

    if (resourceState === 'not_exists') {
        console.info(`Resource: ${name} is removed from bucket: ${bucket}. Do nothing.`)
        callback();
        return;
    }

    if (!SUPPORTED_IMAGES[contentType]) {
        console.info(`Resource: ${name} from bucket: ${bucket} has contentType: ${contentType} which is not supported. Do nothing.`);
        callback();
        return;
    }

    // TODO track log by id
    imageService.resizeImage(bucket, name)
        .then((message) => {
            console.log(`SUCCESS with message: ${message}`);
            callback();
        })
        .catch((err) => {
            console.error('Error:', err);
            callback();
        });
}

let SUPPORTED_IMAGES = {
    'image/png': true,
    'image/jpeg': true
};
