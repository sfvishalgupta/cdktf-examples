import {App} from "cdktf";
import * as Stacks from "./stacks";
import * as Config from "./config";
import {S3BucketConfig} from "@cdktf/provider-aws/lib/s3-bucket";
import {getS3BucketConfig, LambdaWithCodeInS3Config, LambdaWithVersioningConfig} from "./config";
import {LambdaCodeInS3Stack} from "./stacks";

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

/** Basic Lambda Stack */
const lambdaConfig: any = Config.LambdaConfig;
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
new Stacks.BasicLambdaStack(app, "MyLambdaStack", lambdaConfig);

/** Lambda Stack with Version & alias enabled */
const lambdaVersioningConfig: any = Config.LambdaWithVersioningConfig;
lambdaVersioningConfig.roleArn = IamRoleStack.iamRole!.arn;
lambdaVersioningConfig.vpcConfig = {
    securityGroupIds: [vpcStack.securityGroup.id],
    subnetIds: [
        vpcStack.publicSubnet1.id,
        vpcStack.publicSubnet2.id,
        vpcStack.privateSubnet1.id,
        vpcStack.privateSubnet2.id
    ]
}
new Stacks.LambdaWithVersioning(app, "MyVersioningLambdaStack", lambdaVersioningConfig);

/** Lambda with code in S3 Bucket */
const lambdaCodeInS3Config: any = Config.LambdaWithCodeInS3Config;
lambdaCodeInS3Config.roleArn = IamRoleStack.iamRole!.arn;
lambdaCodeInS3Config.s3Bucket = s3BucketStack.S3BucketName;
// lambdaCodeInS3Config.s3Key = "/archive.zip";
lambdaCodeInS3Config.vpcConfig = {
    securityGroupIds: [vpcStack.securityGroup.id],
    subnetIds: [
        vpcStack.publicSubnet1.id,
        vpcStack.publicSubnet2.id,
        vpcStack.privateSubnet1.id,
        vpcStack.privateSubnet2.id
    ]
}
new Stacks.LambdaCodeInS3Stack(app, "MyS3LambdaStack", lambdaCodeInS3Config);


/** Lambda With SQS Stack **/
const lambdaWithSQSConfig: any = Config.LambdaWithSQSConfig;
lambdaWithSQSConfig.roleArn = IamRoleStack.iamRole!.arn;
// lambdaWithSQSConfig.s3Bucket = s3BucketStack.S3BucketName;
lambdaWithSQSConfig.vpcConfig = {
    securityGroupIds: [vpcStack.securityGroup.id],
    subnetIds: [
        vpcStack.publicSubnet1.id,
        vpcStack.publicSubnet2.id,
        vpcStack.privateSubnet1.id,
        vpcStack.privateSubnet2.id
    ]
}
// new Stacks.LambdaWithSQS(app, 'MyLambdaWithSQSStack', lambdaWithSQSConfig);

/** CodeBuild Project **/
// new Stacks.CodebuildStack(app, "MyCodeBuildStack", Config.CodeBuildConfig);

/** Lambda with API Gateway **/
// const lambdaWithApiGatewayConfig: any = Config.lambdaWithApiGatewayConfig;
// lambdaVersioningConfig.roleArn = IamRoleStack.iamRole!.arn;
// lambdaVersioningConfig.vpcConfig = {
//     securityGroupIds: [vpcStack.securityGroup.id],
//     subnetIds: [
//         vpcStack.publicSubnet1.id,
//         vpcStack.publicSubnet2.id,
//         vpcStack.privateSubnet1.id,
//         vpcStack.privateSubnet2.id
//     ]
// }
// new Stacks.LambdaWithApiGatewayStack(app,
//     "MyLambdaWithAPIGatewayStack",
//     lambdaWithApiGatewayConfig
// );
app.synth();
