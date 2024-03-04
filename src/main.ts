import {App} from "cdktf";
import * as Stacks from "./stacks";
import * as Config from "./config";
import {S3BucketConfig} from "@cdktf/provider-aws/lib/s3-bucket";
import {getS3BucketConfig} from "./config";

require("dotenv").config();

const app = new App();

/** Iam Role Stack */
const IamRoleStack: Stacks.LambdaRoleStack = new Stacks.LambdaRoleStack(
    app,
    "MyLambdaRoleStack",
    Config.LambdaCustomPolicy
);

const vpcStack: Stacks.VPCStack = new Stacks.VPCStack(
    app,
    "MyVPCStack",
    Config.getVPCConfig("vpc")
);

const s3BucketStack: Stacks.S3BucketStack = new Stacks.S3BucketStack(
    app,
    "MyS3BucketStack",
    Config.getS3BucketConfig()
)

/** Lambda Stack */
const lambdaConfig: any = Config.LambdaConfig;
lambdaConfig.s3Bucket = s3BucketStack.S3BucketName;
lambdaConfig.roleArn = IamRoleStack.iamRole!.arn;
lambdaConfig.vpcConfig = {
    securityGroupIds: [vpcStack.securityGroup.id],
    subnetIds: [
        vpcStack.publicSubnet1.id,
        vpcStack.publicSubnet2.id,
        vpcStack.privateSubnet1.id,
        vpcStack.privateSubnet2.id
    ]
}
new Stacks.LambdaStack(app, "MyLambdaStack", lambdaConfig);

/** Lambda With SQS Stack **/
const lambdaWithSQSConfig: any = Config.LambdaWithSQSConfig;
lambdaWithSQSConfig.roleArn = IamRoleStack.iamRole!.arn;
lambdaWithSQSConfig.s3Bucket = s3BucketStack.S3BucketName;
lambdaWithSQSConfig.vpcConfig = {
    securityGroupIds: [vpcStack.securityGroup.id],
    subnetIds: [
        vpcStack.publicSubnet1.id,
        vpcStack.publicSubnet2.id,
        vpcStack.privateSubnet1.id,
        vpcStack.privateSubnet2.id
    ]
}
new Stacks.LambdaWithSQS(app, 'MyLambdaWithSQSStack', lambdaWithSQSConfig);

/** CodeBuild Project **/
new Stacks.CodebuildStack(app, "MyCodeBuildStack", Config.CodeBuildConfig);
app.synth();
