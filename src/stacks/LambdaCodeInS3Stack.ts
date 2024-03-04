/**
 * @author Vishal Gupta.
 * This is a Lambda function code in S3 example.
 */

import {Construct} from "constructs";
import {AssetType, TerraformAsset, TerraformOutput} from "cdktf";
import {ILambda, Lambda, S3BackendStack} from 'arc-cdk';
import * as aws from '@cdktf/provider-aws';
import * as random from '@cdktf/provider-random';
import * as Utils from '../utils';
import * as Config from '../config';

export class LambdaCodeInS3Stack extends S3BackendStack {
    private lambda: Lambda | undefined;
    private lambdaName: string | undefined;

    public constructor(scope: Construct, id: string, config: ILambda) {
        super(scope, id, Config.getS3BackendConfig(id));
        new random.provider.RandomProvider(this, 'random');
        this.deployLambda(config)
    }


    private deployLambda(cnf: ILambda) {
        const {
            name,
            s3Bucket,
            codePath,
        } = cnf;

        this.lambdaName = name;
        const config: Omit<ILambda, 'name'> = cnf;
        // if (s3Bucket) {
        //     const asset = new TerraformAsset(
        //         this,
        //         this.lambdaName + "-bucket-asset-zip", {
        //             path: codePath,
        //             type: AssetType.ARCHIVE,
        //         });
        //
        //     new aws.s3BucketObject.S3BucketObject(
        //         this,
        //         this.lambdaName + "-bucket-archive", {
        //             bucket: s3Bucket,
        //             key: asset.fileName,
        //             source: asset.path,
        //         });
        // }

        this.lambda = new Lambda(this, Utils.getResourceName(this.lambdaName), {
            ...config,
            name: this.lambdaName,
        });

        new TerraformOutput(this, this.lambdaName + "-arn", {
            value: this.lambda.arn,
        });
    }
}