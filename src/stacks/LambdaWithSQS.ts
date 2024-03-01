import {Construct} from "constructs";
import {S3BackendStack, LambdaWithSqs, ILambdaWithSqs} from "arc-cdk";
import {resolve} from 'path';
import * as Config from "../config";
import {TerraformOutput} from "cdktf";

require("dotenv").config()

export class LambdaWithSQS extends S3BackendStack {
    constructor(scope: Construct, id: string, config: ILambdaWithSqs) {
        super(scope, id, Config.getS3BackendConfig(id));
        new LambdaWithSqs(this, "lambda-with-sqs", config);
    }
}

