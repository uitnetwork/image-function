import * as Storage from '@google-cloud/storage';
import { FileService } from './file-service';
import { anything, capture, instance, mock, when } from 'ts-mockito';
import { StorageService } from './storage-service';

describe('StorageService', () => {
    let testBucket = 'test-bucket';
    let testName = 'test-name';
    let testDownloadFilePath = '/tmp/testDownloadFilePath.jpg';
    let googleStorage: Storage = mock(Storage);
    let bucket: Storage.Bucket = mock(Storage.Bucket);
    let file: Storage.File = mock(Storage.File);
    let fileService: FileService = mock(FileService);
    let testErrorReason = 'test-error-reason';
    let testLocalFilePath = '/tmp/testLocalFilePath.jpg';

    let storageService: StorageService;

    beforeEach(() => {
        storageService = new StorageService(instance(googleStorage), instance(fileService));
        when(fileService.randomTempFile(testName)).thenReturn(testDownloadFilePath);
    });

    it('should resolve with downloadFilePath after downloaded.', (done) => {
        when(googleStorage.bucket(testBucket)).thenReturn(instance(bucket));
        when(bucket.file(testName)).thenReturn(instance(file));
        let success: [Buffer] = [new Buffer('test-success-buffer')];
        when(file.download(anything())).thenReturn(Promise.resolve(success));

        storageService.downloadFile(testBucket, testName).then(downloadFilePath => {
            expect(downloadFilePath).toBe(testDownloadFilePath);
            let downloadOptions: any;
            [downloadOptions] = capture(file.download).last();
            expect(downloadOptions.destination).toBe(testDownloadFilePath);
            done();
        });
    });

    it('should reject if can not download the file.', (done) => {
        when(googleStorage.bucket(testBucket)).thenReturn(instance(bucket));
        when(bucket.file(testName)).thenReturn(instance(file));
        when(file.download(anything())).thenReturn(Promise.reject(testErrorReason));

        storageService.downloadFile(testBucket, testName).catch(err => {
            expect(err).toBe(testErrorReason);
            let downloadOptions: any;
            [downloadOptions] = capture(file.download).first();
            expect(downloadOptions.destination).toBe(testDownloadFilePath);
            done();
        });
    });

    it('should resolve after successfully uploaded file to storage.', (done) => {
        when(googleStorage.bucket(testBucket)).thenReturn(instance(bucket));
        let success: any = 'any-success';
        when(bucket.upload(anything(), anything())).thenReturn(Promise.resolve(success as [Storage.File]));

        storageService.uploadFile(testLocalFilePath, testBucket, testName).then(msg => {
            expect(msg).toBe('success');

            let localFilePath: any;
            let uploadOptions: any;
            [localFilePath, uploadOptions] = capture(bucket.upload).first();
            expect(localFilePath).toBe(testLocalFilePath);
            expect(uploadOptions.destination).toBe(testName);
            done();
        });
    });

    it('should resolve after successfully uploaded file to storage.', (done) => {
        when(googleStorage.bucket(testBucket)).thenReturn(instance(bucket));
        when(bucket.upload(anything(), anything())).thenReturn(Promise.reject(testErrorReason));

        storageService.uploadFile(testLocalFilePath, testBucket, testName).catch(err => {
            expect(err).toBe(testErrorReason);

            let localFilePath: any;
            let uploadOptions: any;
            [localFilePath, uploadOptions] = capture(bucket.upload).first();
            expect(localFilePath).toBe(testLocalFilePath);
            expect(uploadOptions.destination).toBe(testName);
            done();
        });
    });
});
