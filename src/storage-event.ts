export class StorageEvent {
    constructor(public eventId: string,
                public timestamp: string,
                public eventType: string,
                public resource: string,
                public data: StorageData) {
    }
}

export class StorageData {
    constructor(public kind: string,
                public resourceState: string,
                public name: string,
                public bucket: string,
                public contentType: string) {
    }
}
