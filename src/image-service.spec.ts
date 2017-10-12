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

        let imageMagick: any;
        let storageService: StorageService;
        let fileService: FileService;
        let imageService: ImageService;

        beforeEach(() => {
            imageMagick = mock(Object);
            storageService = mock(StorageService);
            fileService = mock(FileService);

            imageService = new ImageService(instance(imageMagick), instance(storageService), instance((fileService)));
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
    });
});
