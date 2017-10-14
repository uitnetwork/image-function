import { ImageService } from './image-service';
import { instance, mock, verify, when } from 'ts-mockito';
import { StorageService } from './storage-service';
import { FileService } from './file-service';


describe('ImageService', () => {

    describe('isResizedImage', () => {
        let imageMagick: any = mock(Object);
        let storageService: StorageService = mock(StorageService);
        let fileService: FileService = mock(FileService);
        let imageService: ImageService;

        beforeEach(() => {
            imageService = new ImageService(instance(imageMagick), instance(storageService), instance((fileService)));
        });

        it('should return false if the image is not an resized one.', () => {
            let isResizedImage = imageService.isResizedImage('test_image.jpg');

            expect(isResizedImage).toBeFalsy();
        });

        it('should return true if the image is an resized one.', () => {
            let isResizedImage = imageService.isResizedImage('test_image_resized.jpg');

            expect(isResizedImage).toBeTruthy();
        });
    });

    describe('resizeImage', () => {
        let testBucket = 'test-bucket';
        let testImage = 'test_image.jpg';
        let testResizedImage = 'test_image_resized.jpg';
        let testRejectReason = 'test reject reason';
        let testDownloadFilepath = '/tmp/testDownloadFilepath';
        let testRandomDownloadFilepath = '/tmp/testRandomDownloadFilepath';

        let imageMagick: MockImageMagick;
        let storageService: StorageService;
        let fileService: FileService;
        let imageService: ImageService;

        beforeEach(() => {
            imageMagick = new MockImageMagick();
            storageService = mock(StorageService);
            fileService = mock(FileService);

            imageService = new ImageService(imageMagick.imageMagickFun, instance(storageService), instance((fileService)));
        });

        it('should not do anything if image was already resized.', (done) => {
            let resizeImagePromise = imageService.resizeImage(testBucket, testResizedImage);
            resizeImagePromise.then(message => {
                expect(message).toContain('is already resized');
                done();
            });
        });

        it('should response error if having problems downloading file from bucket.', (done) => {
            when(fileService.addSuffix(testImage, ImageService.RESIZED_SUFFIX)).thenReturn(testResizedImage);
            when(storageService.downloadFile(testBucket, testImage)).thenReturn(Promise.reject(testRejectReason));

            let resizeImagePromise = imageService.resizeImage(testBucket, testImage);

            resizeImagePromise.catch(message => {
                verify(fileService.addSuffix(testImage, ImageService.RESIZED_SUFFIX)).once();
                verify(storageService.downloadFile(testBucket, testImage)).once();
                expect(message).toBe(testRejectReason);
                done();
            });
        });

        it('should response error if having problems resizing file.', (done) => {
            when(fileService.addSuffix(testImage, ImageService.RESIZED_SUFFIX)).thenReturn(testResizedImage);
            when(storageService.downloadFile(testBucket, testImage)).thenReturn(Promise.resolve(testDownloadFilepath));
            when(fileService.randomTempFile(testDownloadFilepath)).thenReturn(testRandomDownloadFilepath);
            imageMagick.errorMessage = testRejectReason;

            let resizeImagePromise = imageService.resizeImage(testBucket, testImage);

            resizeImagePromise.catch(message => {
                verify(fileService.addSuffix(testImage, ImageService.RESIZED_SUFFIX)).once();
                verify(storageService.downloadFile(testBucket, testImage)).once();

                expect(imageMagick.imageMagickFun.calls.count()).toBe(1);
                expect(imageMagick.imageMagickFun.calls.first().args[0]).toBe(testDownloadFilepath);

                expect(imageMagick.resize.calls.count()).toBe(1);
                expect(imageMagick.resize.calls.first().args[0]).toBe(50);
                expect(imageMagick.resize.calls.first().args[1]).toBe(50);

                expect(imageMagick.write.calls.count()).toBe(1);
                expect(imageMagick.write.calls.first().args[0]).toBe(testRandomDownloadFilepath);
                expect(message).toBe(testRejectReason);
                done();
            });
        });

        it('should response error if having problems uploading resized image.', (done) => {
            when(fileService.addSuffix(testImage, ImageService.RESIZED_SUFFIX)).thenReturn(testResizedImage);
            when(storageService.downloadFile(testBucket, testImage)).thenReturn(Promise.resolve(testDownloadFilepath));
            when(fileService.randomTempFile(testDownloadFilepath)).thenReturn(testRandomDownloadFilepath);
            imageMagick.errorMessage = undefined;
            when(storageService.uploadFile(testRandomDownloadFilepath, testBucket, testResizedImage)).thenReturn(Promise.reject(testRejectReason));

            let resizeImagePromise = imageService.resizeImage(testBucket, testImage);

            resizeImagePromise.catch(message => {
                expect(message).toBe(testRejectReason);

                verify(fileService.addSuffix(testImage, ImageService.RESIZED_SUFFIX)).once();
                verify(storageService.downloadFile(testBucket, testImage)).once();
                verify(storageService.uploadFile(testRandomDownloadFilepath, testBucket, testResizedImage)).once();
                done();
            });
        });

        it('should response success after successfully upload resized image to storage.', (done) => {
            when(fileService.addSuffix(testImage, ImageService.RESIZED_SUFFIX)).thenReturn(testResizedImage);
            when(storageService.downloadFile(testBucket, testImage)).thenReturn(Promise.resolve(testDownloadFilepath));
            when(fileService.randomTempFile(testDownloadFilepath)).thenReturn(testRandomDownloadFilepath);
            imageMagick.errorMessage = undefined;
            when(storageService.uploadFile(testRandomDownloadFilepath, testBucket, testResizedImage)).thenReturn(Promise.resolve('success'));

            let resizeImagePromise = imageService.resizeImage(testBucket, testImage);

            resizeImagePromise.then(message => {
                expect(message).toContain('was successfully resized');

                verify(fileService.addSuffix(testImage, ImageService.RESIZED_SUFFIX)).once();
                verify(storageService.downloadFile(testBucket, testImage)).once();
                verify(storageService.uploadFile(testRandomDownloadFilepath, testBucket, testResizedImage)).once();
                done();
            });
        });
    });
});

let imageMagickFun = jasmine.createSpy('imageMagickFun').and.callFake

class MockImageMagick {
    errorMessage: any = undefined;

    imageMagickFun = jasmine.createSpy('imageMagickFun').and.callFake((filepath: string) => {
        return this;
    });

    resize = jasmine.createSpy('resize').and.callFake((width: number, height: number) => {
        return this;
    });

    write = jasmine.createSpy('write').and.callFake((filepath: string, callback: (any) => void) => {
        callback(this.errorMessage);
        return this;
    });
}
