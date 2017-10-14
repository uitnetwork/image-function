import { StorageService } from './storage-service';
import { FileService } from './file-service';

export class ImageService {
    static readonly RESIZED_SUFFIX = '_resized';

    // TODO DI framework
    constructor(private imageMagick: any, private storageService: StorageService, private fileService: FileService) {
    }

    isResizedImage(name: string): boolean {
        if (name.includes(ImageService.RESIZED_SUFFIX)) {
            return true;
        }
        return false;
    }

    resizeImage(bucket: string, name: string): Promise<string> {
        if (this.isResizedImage(name)) {
            return Promise.resolve(`${name} is already resized. Ignore.`);
        }

        let resizedImageName = this.fileService.addSuffix(name, ImageService.RESIZED_SUFFIX);

        let result = this.storageService
            .downloadFile(bucket, name)
            .then(downloadFilePath => {
                return this.doResize(downloadFilePath);
            })
            .then(resizedFilePath => {
                return this.storageService.uploadFile(resizedFilePath, bucket, resizedImageName);
            })
            .then(success => {
                return `${name} was successfully resized to ${resizedImageName}.`;
            })
            .catch(err => {
                return Promise.reject(err);
            });

        return result;
    }

    // TODO move this logic to its own class
    private doResize(filePath: string): Promise<string> {
        console.log(`Resizing file: ${filePath}`);

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
