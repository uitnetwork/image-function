import { ImageService } from './image-service';
import { instance, mock } from 'ts-mockito';
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
        let imageMagick: any = mock(Object);
        let storageService: StorageService = mock(StorageService);
        let fileService: FileService = mock(FileService);
        let imageService: ImageService;

        beforeEach(() => {
            imageService = new ImageService(instance(imageMagick), instance(storageService), instance((fileService)));
        });

        it('should not do anything if image was already resized.', (done) => {
            let resizeImagePromise = imageService.resizeImage('test-bucket', 'test_image_resized.jpg');
            resizeImagePromise.then(message => {
                expect(message).toContain('is already resized');
                done();
            });

        });
    });
});
