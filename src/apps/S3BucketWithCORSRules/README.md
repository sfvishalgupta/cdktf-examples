## S3 Bucket with Sync Directory

```javascript
export class S3BucketWithCORSRulesApp {
    constructor(app: App, name: string) {
        const stack: S3BucketStack = new S3BucketStack(app, name, {
            bucket: "665333684765-cdktf-bucket-cors-rules",
            acl: "private",
            corsRule: [{
                allowedMethods: [APIGatewayHTTPMethod.GET],
                allowedOrigins: ["*"],
            }, {
                allowedHeaders: ['*'],
                allowedMethods: [APIGatewayHTTPMethod.PUT, APIGatewayHTTPMethod.POST],
                allowedOrigins: ["https://s3-website-test.hashicorp.com"],
                maxAgeSeconds: 3000,
                exposeHeaders: ["ETag"],
            }]
        });
    }
}
```