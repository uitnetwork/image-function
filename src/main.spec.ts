import { Request, Response } from 'express';
import * as TypeMoq from 'typemoq';
import { StorageData, StorageEvent } from './storage-event';
import { instance, mock, when } from 'ts-mockito';
import * as proxyquire from 'proxyquire';

class MockImageService {
    constructor(private imageMagick: any, private storageService: any, private fileService: any) {
    }

    resizeImage(bucket: string, name: string): Promise<string> {
        return Promise.resolve('SUCCESS');
    }
}

const mockDependencies = {
    'ImageService': MockImageService
};

describe('Main', () => {
    let main = proxyquire.noCallThru().load('./main', {
        './image-service': mockDependencies
    });

    describe('http', () => {
        let mockRequest: TypeMoq.IMock<Request>;
        let mockResponse: TypeMoq.IMock<Response>;

        beforeEach(() => {
            mockRequest = TypeMoq.Mock.ofType<Request>();
            mockResponse = TypeMoq.Mock.ofType<Response>();
        });
        it('should return correct status and message for GET request.', function () {
            mockRequest.setup(it => it.method).returns(() => 'GET');
            mockResponse.setup(it => it.status(TypeMoq.It.isAnyNumber())).returns(() => mockResponse.object);
            mockResponse.setup(it => it.send(TypeMoq.It.isAnyString())).returns(() => mockResponse.object);

            main.http(mockRequest.object, mockResponse.object);

            mockRequest.verify(it => it.method, TypeMoq.Times.once());
            mockResponse.verify(it => it.status(200), TypeMoq.Times.once());
            mockResponse.verify(it => it.send('Hello World From Image Function using TypeScript!'), TypeMoq.Times.once());
        });
    });

    describe('image', () => {
        let testEventId = 'test-event-id';
        let testTimestamp = 'test-timestamp';
        let testEventType = 'test-event-type';
        let testResource = 'test-resource';

        let storageData: StorageData;
        let storageEvent: StorageEvent;


        beforeEach(() => {
            storageData = mock(StorageData);
            storageEvent = new StorageEvent(testEventId, testTimestamp, testEventType, testResource, instance(storageData));

            mockCallBack.calls.reset();
        });

        it('should not do anything if this is delete event.', () => {
            when(storageData.resourceState).thenReturn('not_exists');

            main.image(storageEvent, mockCallBack);

            expect(mockCallBack.calls.count()).toBe(1);
        });

        it('should not do anything if contentType is not supported.', () => {
            when(storageData.resourceState).thenReturn('exists');
            when(storageData.contentType).thenReturn('any-content-type-not-image');

            main.image(storageEvent, mockCallBack);

            expect(mockCallBack.calls.count()).toBe(1);
        });

        it('should do something', (done) => {
            when(storageData.resourceState).thenReturn('exists');
            when(storageData.contentType).thenReturn('image/png');

            main.image(storageEvent, () => {
                mockCallBack();
                expect(mockCallBack.calls.count()).toBe(1);
                done();
            });
        });
    });
});

let mockCallBack = jasmine.createSpy('callback');
