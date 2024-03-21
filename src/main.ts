import {App} from "cdktf";
import {BasicLambdaStack, IAMRoleStack, VPCStack, WafRulesStack, WafWebACLStack} from "./stacks";
import * as Config from "./config";
import {
    CodebuildProjectApp,
    LambdaWithCustomRoleApp,
    LambdaWithDockerApp,
    LambdaWithSQSApp,
    WAFWebACLApp
} from "./apps";

require("dotenv").config();

class MyApp extends App {
    private IamRoleStack: IAMRoleStack | undefined;
    private basicLambdaStack: BasicLambdaStack | undefined;
    private vpcStack: VPCStack | undefined;
    private wafWebACLStack: WafWebACLStack | undefined;

    addVPCStack(name: string) {
        this.vpcStack = new VPCStack(app, name, Config.getVPCConfig("vpc"));
        return this;
    }

    addWafRuleStack(name: string) {
        new WafRulesStack(app, name);
        return this;
    }

    addWafStack(name: string) {
        new WAFWebACLApp(app, name);
        return this;
    }

    addLambdaWithCustomRoleApp(name: string) {
        new LambdaWithCustomRoleApp(app, name, false);
        return this;
    }


    addS3BucketStack(name: string) {
        // this.s3BucketStack = new S3BucketStack(
        //     app,
        //     name,
        //     Config.GetS3BucketConfig()
        // );
        return this;
    }

    addCodeBuildProjectApp(name: string) {
        new CodebuildProjectApp(app, name);
        return this;
    }

    addLambdaWithVersioning(name: string) {
        const lambdaConfig: any = Config.GetLambdaWithVersioningConfig(
            // @ts-ignore
            this.IamRoleStack.iamRole.arn,
        );
        lambdaConfig.vpcConfig = this.getVPCConfig();
        // this.versioningLambda = new BasicLambdaStack(app, name, lambdaConfig);
        return this;
    }

    addRestAPIGatewayVersioningStack(name: string) {
        // @ts-ignore
        // const lambdaFn = this.versioningLambda.lambda?.arn!;
        // new RestAPIGatewayStack(app, name, Config.GetApiGatewayConfigVersioning(lambdaFn))
        return this;
    }

    /**
     * Adds a Lambda function with an SQS queue as an event source.
     * @param name - The name of the stack.
     */
    addLambdaWithSQSApp(name: string) {
        new LambdaWithSQSApp(app, name);
        return this;
    }

    getVPCConfig() {
        return {
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
        };
    }

    addDockerLambdaApp(lambdaName: string) {
        new LambdaWithDockerApp(app, lambdaName, true);
        return this;
    }
}

const app = new MyApp();
app
    // .addVPCStack("MyVPCStack")
    // /** Waf Stack for Blocking IP */
    // .addWafRuleStack("MyIPBlackListWafRule")
    // .addS3BucketStack("MyS3BucketStack")
    // /** Lambda and Rest API Gateway with Versioning */
    // .addLambdaWithVersioning("MyVersioningLambda")
    // .addRestAPIGatewayVersioningStack("MyRestAPIGatewayVersioning")
    .addWafStack("waf-web-acl")
    .addCodeBuildProjectApp("codebuild-project")
    .addLambdaWithCustomRoleApp("lambda-with-custom-role")
    .addDockerLambdaApp("lambda-with-docker")
    .addLambdaWithSQSApp("lambda-with-sqs")
    .synth();
