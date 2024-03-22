import {App} from "cdktf";
import {S3BucketStack} from "../../stacks";
import {resolve} from "path";

export class S3BucketWithSyncDirApp {
    constructor(app: App, name: string) {
        const stack: S3BucketStack = new S3BucketStack(app, name, {
            bucket: "665333684765-cdktf-bucket-sync-dir",
            acl: "private"
        });
        stack.S3Bucket.syncFilesToBucket(resolve(__dirname, "./dist/"));
    }
}
