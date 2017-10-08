import { FileService } from './file-service';
import * as path from 'path';

describe('FileService', () => {

    let fileService = new FileService();

    it('should random temp file with same extension', () => {
        let randomTempFile = fileService.randomTempFile('/tmp/test.jpg');

        expect(path.extname(randomTempFile)).toBe('.jpg');
    });

    it('should random temp file with absolute path', () => {
        let randomTempFile = fileService.randomTempFile('test.txt');

        expect(path.isAbsolute(randomTempFile)).toBeTruthy();
    });

    it('should random different temp files if calling multiple times', () => {
        let testFile = 'test.txt';
        let randomTempFile1 = fileService.randomTempFile(testFile);
        let randomTempFile2 = fileService.randomTempFile(testFile);

        expect(randomTempFile1).not.toBe(randomTempFile2);
    });

    it('should add suffix to filename with same extension', () => {
        let fileWithSuffix = fileService.addSuffix('test.txt', '_testSuffix');

        expect(fileWithSuffix).toBe('test_testSuffix.txt');
    });

    it('should add suffix to filename with same extension and same parent directory', () => {
        let fileWithSuffix = fileService.addSuffix('/testDir1/testDir2/test.txt', '_testSuffix');

        expect(fileWithSuffix).toBe('/testDir1/testDir2/test_testSuffix.txt');
    });
});
