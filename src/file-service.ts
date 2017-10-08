import * as uuid from 'uuid';
import * as path from 'path';
import * as os from 'os';

export class FileService {
    randomTempFile(referenceFile: string): string {
        let extension = path.extname(referenceFile);
        let randomName = `${uuid.v4()}${extension}`;
        let randomTemFile = path.join(os.tmpdir(), randomName);

        return randomTemFile;
    }

    addSuffix(file: string, suffix: string): string {
        let prefix = path.dirname(file);
        let parsedPath = path.parse(file);
        let resizedName = `${parsedPath.name}${suffix}${parsedPath.ext}`;

        if (prefix !== '.') {
            return `${prefix}/${resizedName}`;
        }

        return resizedName;
    }
}
