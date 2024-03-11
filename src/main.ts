import {App} from "cdktf";
import {BasicLambdaStack, CodebuildStack, LambdaRoleStack, RestAPIGateway, S3BucketStack, VPCStack} from "./stacks";
import * as Config from "./config";
import {GetApiGatewayConfigVersioning, GetLambdaWithVersioningConfig} from "./config";

require("dotenv").config();

class MyApp extends App {
    private IamRoleStack: LambdaRoleStack | undefined;
    private basicLambdaStack: BasicLambdaStack | undefined;
    private s3BucketStack: S3BucketStack | undefined;
    private vpcStack: VPCStack | undefined;
    private versioningLambda: BasicLambdaStack | undefined;

    addIamRoleStack(name: string) {
        this.IamRoleStack = new LambdaRoleStack(
            this,
            "MyIamRoleStack",
            Config.LambdaCustomPolicy
        );
        return this;
    }

    addLambdaStack(name: string) {
        const lambdaConfig: any = Config.GetLambdaConfig(
            // @ts-ignore
            this.IamRoleStack.iamRole.arn,
        );
        lambdaConfig.vpcConfig = {
            // @ts-ignore
            securityGroupIds: [this.vpcStack.securityGroup.id],
            subnetIds: [
                // @ts-ignore
                this.vpcStack.publicSubnet1.id,
                // @ts-ignore
                this.vpcStack.publicSubnet2.id,
                // @ts-ignore
                this.vpcStack.privateSubnet1.id,
                // @ts-ignore
                this.vpcStack.privateSubnet2.id
            ]
        }
        this.basicLambdaStack = new BasicLambdaStack(app, name, lambdaConfig);
        return this;
    }

    addRestAPIGatewayStack(name: string) {
        // const  lambdaFn="arn:aws:lambda:us-east-2:665333684765:function:cdktf-testing-plain-print-lambda";
        // @ts-ignore
        const lambdaFn = this.basicLambdaStack.lambda?.arn!;
        new RestAPIGateway(app, name, Config.GetApiGatewayConfig(lambdaFn))
        return this;
    }

    addS3BucketStack(name: string) {
        this.s3BucketStack = new S3BucketStack(
            app,
            name,
            Config.GetS3BucketConfig()
        );
        return this;
    }

    addVPCStack(name: string) {
        this.vpcStack = new VPCStack(app, name, Config.getVPCConfig("vpc"));
        return this;
    }

    addCodeBuildProject(name: string) {
        new CodebuildStack(app, name, Config.CodeBuildConfig);
        return this;
    }

    addLambdaWithVersioning(name: string) {
        const lambdaConfig: any = Config.GetLambdaWithVersioningConfig(
            // @ts-ignore
            this.IamRoleStack.iamRole.arn,
        );
        lambdaConfig.vpcConfig = {
            // @ts-ignore
            securityGroupIds: [this.vpcStack.securityGroup.id],
            subnetIds: [
                // @ts-ignore
                this.vpcStack.publicSubnet1.id,
                // @ts-ignore
                this.vpcStack.publicSubnet2.id,
                // @ts-ignore
                this.vpcStack.privateSubnet1.id,
                // @ts-ignore
                this.vpcStack.privateSubnet2.id
            ]
        }
        this.versioningLambda = new BasicLambdaStack(app, name, lambdaConfig);
        return this;
    }

    addRestAPIGatewayVersioningStack(name: string) {
        // @ts-ignore
        const lambdaFn = this.versioningLambda.lambda?.arn!;
        new RestAPIGateway(app, name, Config.GetApiGatewayConfigVersioning(lambdaFn))
        return this;
    }
}

const app = new MyApp();
app.addIamRoleStack("MyIamRoleStack")
    .addVPCStack("MyVPCStack")
    .addS3BucketStack("MyS3BucketStack")
    .addCodeBuildProject("MyCodeBuildStack")
    .addLambdaStack("MyLambdaStack")
    .addRestAPIGatewayStack("MyRestAPIGateway")
    .addLambdaWithVersioning("MyVersioningLambda")
    .addRestAPIGatewayVersioningStack("MyRestAPIGatewayVersioning")

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
//     "",
//     lambdaWithApiGatewayConfig
// );
app.synth();
