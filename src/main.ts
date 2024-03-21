import {App} from "cdktf";
import {BasicLambdaStack, IAMRoleStack, VPCStack, WafWebACLStack} from "./stacks";
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
    private vpcStack: VPCStack | undefined;

    addVPCStack(name: string) {
        this.vpcStack = new VPCStack(app, name, Config.getVPCConfig("vpc"));
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

    addCodeBuildProjectApp(name: string) {
        new CodebuildProjectApp(app, name);
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
    .addWafStack("waf-web-acl")
    .addCodeBuildProjectApp("codebuild-project")
    .addLambdaWithCustomRoleApp("lambda-with-custom-role")
    .addDockerLambdaApp("lambda-with-docker")
    .addLambdaWithSQSApp("lambda-with-sqs")
    .synth();
