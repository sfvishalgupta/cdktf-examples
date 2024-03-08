/**
 * @author Vishal Gupta.
 * This is a Basic Lambda function example.
 */

import {Construct} from "constructs";
import {TerraformOutput} from "cdktf";
import {ILambda, Lambda, S3BackendStack} from 'arc-cdk';
import * as aws from '@cdktf/provider-aws';
import * as random from '@cdktf/provider-random';
import * as Utils from '../utils';
import * as Config from '../config';

export class BasicLambdaStack extends S3BackendStack {

    private lambdaName: string | undefined;
    lambda: Lambda | undefined;

    public constructor(scope: Construct, id: string, config: ILambda) {
        super(scope, id, Config.getS3BackendConfig(id));
        new random.provider.RandomProvider(this, 'random');
        this.deployLambda(config)
    }

    private deployLambda(cnf: ILambda) {
        this.lambdaName = cnf.name;
        const config: Omit<ILambda, 'name'> = cnf;
        this.lambda = new Lambda(this, Utils.getResourceName(this.lambdaName), {
            ...config,
            name: this.lambdaName,
        });

        new TerraformOutput(this, this.lambdaName + "-arn", {
            value: this.lambda.arn,
        });
    }
}