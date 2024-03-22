import {App} from "cdktf";
import {S3BucketStack} from "../../stacks";
import {APIGatewayHTTPMethod} from "arc-cdk";

export class S3BucketWithCORSRulesApp {
    constructor(app: App, name: string) {
        const stack: S3BucketStack = new S3BucketStack(app, name, {
            bucket: "665333684765-cdktf-bucket-cors-rules",
            acl: "private"
        });
        stack.S3Bucket.updateCorsConfiguration([{
            allowedMethods: [APIGatewayHTTPMethod.GET],
            allowedOrigins: ["*"],
        }, {
            allowedHeaders: ['*'],
            allowedMethods: [APIGatewayHTTPMethod.PUT, APIGatewayHTTPMethod.POST],
            allowedOrigins: ["https://s3-website-test.hashicorp.com"],
            maxAgeSeconds: 3000,
            exposeHeaders: ["ETag"],
        }]);
    }
}
