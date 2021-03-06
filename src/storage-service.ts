import * as Storage from '@google-cloud/storage';
import { FileService } from './file-service';

export class StorageService {

    constructor(private googleStorage: Storage, private fileService: FileService) {
    }

    downloadFile(bucket: string, name: string): Promise<string> {
        console.log('Downloading file: %s from bucket: %s', name, bucket);

        let downloadFilePath = this.fileService.randomTempFile(name);

        let result = this.googleStorage.bucket(bucket)
            .file(name)
            .download({destination: downloadFilePath})
            .then(() => {
                return downloadFilePath;
            })
            .catch(err => {
                return Promise.reject(err);
            });

        return result;
    }

    uploadFile(localFilePath: string, bucket: string, name: string): Promise<string> {
        console.log(`Uploading local: ${localFilePath} to remote: ${name} in bucket: ${bucket}`);

        let result = this.googleStorage.bucket(bucket)
            .upload(localFilePath, {destination: name})
            .then(() => {
                return 'success';
            })
            .catch(err => {
                return Promise.reject(err);
            });

        return result;
    }
}
