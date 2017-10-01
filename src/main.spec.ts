import * as main from './main';

describe('Http Function', () => {
    it('should return correct status and message', function () {
        let mockResponse = new MockResponse();
        main.http(undefined, mockResponse);
        expect(mockResponse.statusNumber).toBe(200);
        expect(mockResponse.message).toBe('Hello World From Image Function using TypeScript!');
    });
});

class MockResponse {
    statusNumber: number;
    message: string;

    status(status: number): MockResponse {
        this.statusNumber = status;
        return this;
    }

    send(message: string) {
        this.message = message;
    }
}
