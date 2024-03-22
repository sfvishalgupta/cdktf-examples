import {Construct} from "constructs";
import {S3BucketConfig} from "@cdktf/provider-aws/lib/s3-bucket";

import {S3, S3BackendStack} from "arc-cdk";
import * as Config from "../config";

require("dotenv").config()

export class S3BucketStack extends S3BackendStack {
    S3Bucket: S3
    S3BucketName: string

    constructor(scope: Construct, id: string, config: S3BucketConfig) {
        super(scope, id, Config.getS3BackendConfig(id));
        this.S3BucketName = config.bucket!;
        this.S3Bucket = new S3(this, id, config);
        // bucket.updateBucketPreventDestroy(true);
        /**
         * Upload directory as a zip file to the specified bucket.
         */
        // bucket.uploadFolderAsZip(path.resolve(__dirname, "../dist/"));

        /**
         * Upload directory content recursive to the specified bucket.
         */
        // bucket.syncFilesToBucket(path.resolve(__dirname, "../dist/"));

        /**
         * Set Cors rule of the bucket.
         */
        // bucket.updateCorsConfiguration(corsRules);

        /**
         * Set Cors rule of the bucket via JSON file.
         */
        // bucket.updateCorsConfiguration(path.resolve(__dirname, "./config/cors.json"));
        // new TerraformOutput(this, 'S3 arn', {
        //     value: this.S3Bucket.arn,
        // });
    }
}