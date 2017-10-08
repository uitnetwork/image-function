import { StorageService } from './storage-service';
import * as gm from 'gm';
import { FileService } from './file-service';

export class ImageService {
    static readonly RESIZED_SUFFIX = '_resized';

    private imageMagick = gm.subClass({imageMagick: true});

    private storageService = new StorageService();

    private fileService = new FileService();

    isResizedImage(name: string): boolean {
        if (name.includes(ImageService.RESIZED_SUFFIX)) {
            return true;
        }
        return false;
    }

    resizeImage(bucket: string, name: string) {
        if (this.isResizedImage(name)) {
            console.log(`${name} is already resized. Ignore.`);
            return;
        }

        let resizedImageName = this.fileService.addSuffix(name, ImageService.RESIZED_SUFFIX);

        let fileReadStream = this.storageService
            .downloadFile(bucket, name)
            .then(downloadFilePath => {
                return this.doResize(downloadFilePath);
            })
            .then(resizedFilePath => {
                return this.storageService.uploadFile(resizedFilePath, bucket, resizedImageName);
            })
            .then(success => console.info(`${name} was successfully resized to ${resizedImageName}.`))
            .catch(err => {
                console.error(`Error processing: ${name} from bucket: ${bucket}`, err);
            });
    }

    private doResize(filePath: string): Promise<string> {
        let promiseResolve, promiseReject;
        let promise = new Promise<string>((resolve, reject) => {
            promiseResolve = resolve;
            promiseReject = reject;
        });

        let randomResizedFilePath = this.fileService.randomTempFile(filePath);

        this.imageMagick(filePath)
            .resize(50, 50) // TODO: have multiple options
            .write(randomResizedFilePath, err => {
                console.log(`Resized ${filePath} to: ${randomResizedFilePath} with err: ${err}`);
                if (!err) {
                    promiseResolve(randomResizedFilePath);
                } else {
                    promiseReject(err);
                }
            });

        return promise;
    }
}
