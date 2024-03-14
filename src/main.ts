import {App} from "cdktf";
import {
    BasicLambdaStack,
    CodebuildStack,
    IAMRoleStack,
    LambdaWithSQSStack,
    RestAPIGatewayStack,
    VPCStack,
    WafRulesStack,
    WafWebACLStack
} from "./stacks";
import * as Config from "./config";

require("dotenv").config();

class MyApp extends App {
    private IamRoleStack: IAMRoleStack | undefined;
    private basicLambdaStack: BasicLambdaStack | undefined;
    private vpcStack: VPCStack | undefined;
    private wafWebACLStack: WafWebACLStack | undefined;
    private iamRoleARN: string | undefined;

    addIamRoleStack(name: string) {
        const roleStack: IAMRoleStack = new IAMRoleStack(this, name);
        this.iamRoleARN = roleStack.iamRoleARN;
        return this;
    }

    addVPCStack(name: string) {
        this.vpcStack = new VPCStack(app, name, Config.getVPCConfig("vpc"));
        return this;
    }

    addWafRuleStack(name: string) {
        new WafRulesStack(app, name);
        return this;
    }

    addWafStack(name: string) {
        this.wafWebACLStack = new WafWebACLStack(app, name);
        return this;
    }

    addLambdaStack(name: string) {
        const lambdaConfig: any = Config.GetLambdaConfig(name, "plain-print-lambda", this.iamRoleARN!);
        if (this.vpcStack) {
            lambdaConfig.vpcConfig = this.getVPCConfig();
        }
        this.basicLambdaStack = new BasicLambdaStack(app, name, lambdaConfig);
        return this;
    }

    addRestAPIGatewayStack(name: string) {
        const lambdaFn = this.basicLambdaStack?.lambda?.arn!;
        new RestAPIGatewayStack(app, name, lambdaFn, this.wafWebACLStack?.wafWebACL.WafWebACL.arn);
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


    addCodeBuildProject(name: string) {
        new CodebuildStack(app, name);
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
    addLambdaWithSQS(name: string) {
        const lambdaWithSQSConfig: any = Config.LambdaWithSQSConfig;
        // @ts-ignore
        lambdaWithSQSConfig.roleArn = this.IamRoleStack.iamRole!.arn;
        lambdaWithSQSConfig.vpcConfig = this.getVPCConfig();
        new LambdaWithSQSStack(app, name, lambdaWithSQSConfig);
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
}

const app = new MyApp();
app
    .addIamRoleStack("MyIamRoleStack")
    // .addVPCStack("MyVPCStack")
    //
    // /** Waf Stack for Blocking IP */
    .addWafRuleStack("MyIPBlackListWafRule")
    .addWafStack("MyWafWebACLStack")
    //
    // .addS3BucketStack("MyS3BucketStack")
    .addCodeBuildProject("MyCodeBuildStack")
    // .addLambdaWithSQS("MyLambdaWithSQSStack")
    //
    // /** Lambda and Rest API Gateway */
    .addLambdaStack("MyLambdaStack")
    .addRestAPIGatewayStack("MyRestAPIGateway")
    //
    // /** Lambda and Rest API Gateway with Versioning */
    // .addLambdaWithVersioning("MyVersioningLambda")
    // .addRestAPIGatewayVersioningStack("MyRestAPIGatewayVersioning")

    .synth();
