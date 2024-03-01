import {Construct} from "constructs";
import {TerraformOutput} from "cdktf";
import {ILambda, Lambda, S3BackendStack} from 'arc-cdk';
import * as aws from '@cdktf/provider-aws';
import * as random from '@cdktf/provider-random';
import * as Utils from '../utils';
import * as Config from '../config';

export class LambdaStack extends S3BackendStack {
    private lambda: Lambda | undefined;
    private lambdaName: string | undefined;

    public constructor(scope: Construct, id: string, config: ILambda) {
        super(scope, id, Config.getS3BackendConfig(id));
        new random.provider.RandomProvider(this, 'random');
        this.deployLambda(config)
    }

    private setLambdaRole() {
        const policy = new aws.iamPolicy.IamPolicy(this,
            this.lambdaName + "iam-policy", {
                name: Utils.getResourceName(this.lambdaName + "iam-policy"),
                description: "test iam policy for " + this.lambdaName,
                policy: JSON.stringify(Config.LambdaCustomPolicy)
            })

        return new aws.iamRole.IamRole(this, this.lambdaName + "-role", {
            name: Utils.getResourceName(this.lambdaName + "-role"),
            assumeRolePolicy: JSON.stringify(Config.LambdaAssumeRolePolicy),
            managedPolicyArns: [policy.arn]
        });
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