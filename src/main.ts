import {App} from "cdktf";
import {BasicLambdaStack, LambdaRoleStack, RestAPIGateway,} from "./stacks";
import {APIEndPointType, Authorizer, HTTPMethod, APILoggingLevel} from "./constants";
import * as Config from "./config";
import * as listCats from "./schema/listCats.json";

require("dotenv").config();

const app = new App();

/** Iam Role Stack */
const IamRoleStack: LambdaRoleStack = new LambdaRoleStack(app, "MyLambdaRoleStack", Config.LambdaCustomPolicy);

// const vpcStack: VPCStack = new VPCStack(
//     app,
//     "MyVPCStack",
//     Config.getVPCConfig("vpc")
// );

// const s3BucketStack: S3BucketStack = new S3BucketStack(
//     app,
//     "MyS3BucketStack",
//     Config.getS3BucketConfig()
// )

/** Basic Lambda Stack */
const lambdaConfig: any = Config.LambdaConfig;
lambdaConfig.roleArn = IamRoleStack.iamRole!.arn;
// lambdaConfig.vpcConfig = {
//     securityGroupIds: [vpcStack.securityGroup.id],
//     subnetIds: [
//         vpcStack.publicSubnet1.id,
//         vpcStack.publicSubnet2.id,
//         vpcStack.privateSubnet1.id,
//         vpcStack.privateSubnet2.id
//     ]
// }
const basicLambdaStack: BasicLambdaStack = new BasicLambdaStack(app, "MyLambdaStack", lambdaConfig);
const  lambdaFn="arn:aws:lambda:us-east-2:665333684765:function:cdktf-testing-plain-print-lambda";
// const lambdaFn = basicLambdaStack.lambda?.arn!;
// basicLambdaStack.lambda?.arn
new RestAPIGateway(app, "MyRestAPIGateway", {
    name: "MyRestAPIGateway",
    region: process.env.region!,
    type: APIEndPointType.REGIONAL,
    tags: Config.tags,
    description: "Created by cdktf",
    stageName: "prod",
    loggingLevel: APILoggingLevel.OFF,
    proxyIntegrations: [{
        name: "Cats",
        path: "cats",
        methods: [{
            name: "listCats",
            authorization: Authorizer.NONE,
            method: HTTPMethod.GET,
            lambdaName: lambdaFn!,
            apiKeyRequired: false,
            schema: JSON.stringify(listCats),
            // enableCORS: true,
        }, {
            name: "createCat",
            authorization: Authorizer.NONE,
            method: HTTPMethod.POST,
            lambdaName: lambdaFn,
            apiKeyRequired: false,
            schema: JSON.stringify(listCats)
        }],
    }]
})

/** Lambda Stack with Version & alias enabled */
// const lambdaVersioningConfig: any = Config.LambdaWithVersioningConfig;
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
// new LambdaWithVersioning(app, "MyVersioningLambdaStack", lambdaVersioningConfig);

/** Lambda with code in S3 Bucket */
// const lambdaCodeInS3Config: any = Config.LambdaWithCodeInS3Config;
// lambdaCodeInS3Config.roleArn = IamRoleStack.iamRole!.arn;
// lambdaCodeInS3Config.s3Bucket = s3BucketStack.S3BucketName;
// // lambdaCodeInS3Config.s3Key = "/archive.zip";
// lambdaCodeInS3Config.vpcConfig = {
//     securityGroupIds: [vpcStack.securityGroup.id],
//     subnetIds: [
//         vpcStack.publicSubnet1.id,
//         vpcStack.publicSubnet2.id,
//         vpcStack.privateSubnet1.id,
//         vpcStack.privateSubnet2.id
//     ]
// }
// new LambdaCodeInS3Stack(app, "MyS3LambdaStack", lambdaCodeInS3Config);


/** Lambda With SQS Stack **/
// const lambdaWithSQSConfig: any = Config.LambdaWithSQSConfig;
// lambdaWithSQSConfig.roleArn = IamRoleStack.iamRole!.arn;
// // lambdaWithSQSConfig.s3Bucket = s3BucketStack.S3BucketName;
// lambdaWithSQSConfig.vpcConfig = {
//     securityGroupIds: [vpcStack.securityGroup.id],
//     subnetIds: [
//         vpcStack.publicSubnet1.id,
//         vpcStack.publicSubnet2.id,
//         vpcStack.privateSubnet1.id,
//         vpcStack.privateSubnet2.id
//     ]
// }
// new LambdaWithSQS(app, 'MyLambdaWithSQSStack', lambdaWithSQSConfig);

/** CodeBuild Project **/
// new CodebuildStack(app, "MyCodeBuildStack", Config.CodeBuildConfig);

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
// new LambdaWithApiGatewayStack(app,
//     "MyLambdaWithAPIGatewayStack",
//     lambdaWithApiGatewayConfig
// );
app.synth();
