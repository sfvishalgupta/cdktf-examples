## S3 Bucket with Sync Directory

```javascript
export class S3BucketWithZipContentApp {
    constructor(app: App, name: string) {
        const stack: S3BucketStack = new S3BucketStack(app, name, {
            bucket: "665333684765-cdktf-bucket-sync-zip-content",
            acl: "private"
        });
        stack.S3Bucket.uploadFolderAsZip(resolve(__dirname, "./dist/"));
    }
}
```