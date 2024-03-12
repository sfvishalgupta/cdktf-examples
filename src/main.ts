import {App} from "cdktf";
import {
    BasicLambdaStack,
    CodebuildStack,
    IAMRoleStack,
    LambdaWithSQSStack,
    RestAPIGatewayStack,
    S3BucketStack,
    VPCStack,
    WafRulesStack,
    WafWebACLStack
} from "./stacks";
import * as Config from "./config";
import {Wafv2WebAclRule} from "@cdktf/provider-aws/lib/wafv2-web-acl/index-structs";

require("dotenv").config();

class MyApp extends App {
    private IamRoleStack: IAMRoleStack | undefined;
    private basicLambdaStack: BasicLambdaStack | undefined;
    private s3BucketStack: S3BucketStack | undefined;
    private vpcStack: VPCStack | undefined;
    private versioningLambda: BasicLambdaStack | undefined;
    private wafStack: WafWebACLStack | undefined;
    private wafRules: Wafv2WebAclRule[] = [];

    addIamRoleStack(name: string) {
        this.IamRoleStack = new IAMRoleStack(this, name, Config.LambdaCustomPolicy);
        return this;
    }

    addLambdaStack(name: string) {
        const lambdaConfig: any = Config.GetLambdaConfig(
            // @ts-ignore
            this.IamRoleStack.iamRole.arn,
        );
        lambdaConfig.vpcConfig = this.getVPCConfig();
        this.basicLambdaStack = new BasicLambdaStack(app, name, lambdaConfig);
        return this;
    }

    addRestAPIGatewayStack(name: string) {
        // const  lambdaFn="arn:aws:lambda:us-east-2:665333684765:function:cdktf-testing-plain-print-lambda";
        // @ts-ignore
        const lambdaFn = this.basicLambdaStack.lambda?.arn!;
        new RestAPIGatewayStack(app, name,
            Config.GetApiGatewayConfig(
                lambdaFn,
                // @ts-ignore
                this.wafStack.webACL.arn
            )
        )
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
        lambdaConfig.vpcConfig = this.getVPCConfig();
        this.versioningLambda = new BasicLambdaStack(app, name, lambdaConfig);
        return this;
    }

    addRestAPIGatewayVersioningStack(name: string) {
        // @ts-ignore
        const lambdaFn = this.versioningLambda.lambda?.arn!;
        new RestAPIGatewayStack(app, name, Config.GetApiGatewayConfigVersioning(lambdaFn))
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

    addWafRuleStack(name: string) {
        const ruleStack = new WafRulesStack(app, name, Config.IPBlackListRule)
        this.wafRules.push(Config.GetWebACLIPBlackListRule(
            ruleStack.ipSet.arn
        ));
        return this;
    }

    addWafStack(name: string) {
        this.wafRules.push(Config.GetRateBasedWafRule());
        this.wafStack = new WafWebACLStack(app, name, Config.GetWebACLConfig(this.wafRules));
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
    .addVPCStack("MyVPCStack")

    /** Waf Stack for Blocking IP */
    .addWafRuleStack("MyWafRuleStack")
    .addWafStack("MyWafStack")

    .addS3BucketStack("MyS3BucketStack")
    // .addCodeBuildProject("MyCodeBuildStack")
    // .addLambdaWithSQS("MyLambdaWithSQSStack")

    /** Lambda and Rest API Gateway */
    .addLambdaStack("MyLambdaStack")
    // .addRestAPIGatewayStack("MyRestAPIGateway")

    /** Lambda and Rest API Gateway with Versioning */
    // .addLambdaWithVersioning("MyVersioningLambda")
    // .addRestAPIGatewayVersioningStack("MyRestAPIGatewayVersioning")


    .synth();
