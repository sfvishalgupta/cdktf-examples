import {Construct} from "constructs";
import {TerraformOutput} from "cdktf";
import {ILambda, Lambda, S3BackendStack} from 'arc-cdk';
import * as aws from '@cdktf/provider-aws';
import * as random from '@cdktf/provider-random';
import * as Utils from '../utils';
import * as Config from '../config';

export class LambdaWithVersioning extends S3BackendStack {
    private lambda: Lambda | undefined;
    private lambdaName: string | undefined;

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

        new aws.lambdaAlias.LambdaAlias(this, Utils.getResourceName(this.lambdaName) + '-alias', {
            // functionVersion: this.lambda.lambdaFunc.version,
            functionVersion: '$LATEST',
            name: 'my_alias',
            functionName: this.lambda.arn,
        });

        new TerraformOutput(this, this.lambdaName + "-arn", {
            value: this.lambda.arn,
        });

        new TerraformOutput(this, this.lambdaName + "-version", {
            value: this.lambda.lambdaFunc.version,
        });
    }
}