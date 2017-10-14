import { StorageData, StorageEvent } from './storage-event';
import { instance, mock } from 'ts-mockito';

describe('StorageEvent', () => {
    let testEventId = 'test-event-id';
    let testTimestamp = 'test-timestamp';
    let testEventType = 'test-event-type';
    let testResource = 'test-resource';
    let testData = instance(mock(StorageData));

    let storageEvent = new StorageEvent(testEventId, testTimestamp, testEventType, testResource, testData);

    it('should create object with correct properties', () => {
        expect(storageEvent.eventId).toBe(testEventId);
        expect(storageEvent.timestamp).toBe(testTimestamp);
        expect(storageEvent.eventType).toBe(testEventType);
        expect(storageEvent.resource).toBe(testResource);
        expect(storageEvent.data).toBe(testData);
    });
});

describe('StorageData', () => {
    let testKind = 'test-kind';
    let testResourceState = 'test-resource-state';
    let testName = 'test-name';
    let testBucket = 'test-bucket';
    let testContentType = 'test-content-type';

    let storageData = new StorageData(testKind, testResourceState, testName, testBucket, testContentType);

    it('should create object with correct properties', () => {
        expect(storageData.kind).toBe(testKind);
        expect(storageData.resourceState).toBe(testResourceState);
        expect(storageData.name).toBe(testName);
        expect(storageData.bucket).toBe(testBucket);
        expect(storageData.contentType).toBe(testContentType);
    });
});
