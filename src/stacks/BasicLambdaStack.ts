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
import {IAdvancedLambda} from "../interfaces";

export class BasicLambdaStack extends S3BackendStack {

    private lambdaName: string | undefined;
    lambda: Lambda | undefined;

    public constructor(scope: Construct, id: string, config: IAdvancedLambda) {
        super(scope, id, Config.getS3BackendConfig(id));
        new random.provider.RandomProvider(this, 'random');
        this.deployLambda(config)
    }

    private deployLambda(cnf: IAdvancedLambda) {
        this.lambdaName = cnf.name;
        const config: Omit<ILambda, 'name'> = cnf;
        this.lambda = new Lambda(this, Utils.getResourceName(this.lambdaName), {
            ...config,
            name: this.lambdaName,
        });

        if(cnf.enableAlias){
            new aws.lambdaAlias.LambdaAlias(this, Utils.getResourceName(this.lambdaName) + '-alias', {
                functionVersion: cnf.aliasVersion!,
                name: cnf.aliasName!,
                functionName: this.lambda.arn,
            });
        }

        new TerraformOutput(this, this.lambdaName + "-arn", {
            value: this.lambda.arn,
        });
    }
}