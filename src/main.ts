import {App} from "cdktf";
import {VPCStack} from "./stacks";
import * as Config from "./config";
import {
    CodebuildProjectApp,
    LambdaWithCustomRoleApp,
    LambdaWithDockerApp,
    LambdaWithSQSApp, S3BucketWithCORSRulesApp,
    S3BucketWithSyncDirApp,
    S3BucketWithZipContentApp,
    WAFWebACLApp
} from "./apps";

require("dotenv").config();

class MyApp extends App {
    private vpcStack: VPCStack | undefined;

    addVPCStack(name: string) {
        this.vpcStack = new VPCStack(this, name, Config.getVPCConfig("vpc"));
        return this;
    }

    addWafStack(name: string) {
        new WAFWebACLApp(this, name);
        return this;
    }

    addLambdaWithCustomRoleApp(name: string) {
        new LambdaWithCustomRoleApp(this, name, false);
        return this;
    }

    addCodeBuildProjectApp(name: string) {
        new CodebuildProjectApp(this, name);
        return this;
    }

    /**
     * Adds a Lambda function with an SQS queue as an event source.
     * @param name - The name of the stack.
     */
    addLambdaWithSQSApp(name: string) {
        new LambdaWithSQSApp(this, name);
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
        new LambdaWithDockerApp(this, lambdaName, true);
        return this;
    }

    addS3BucketWithSyncDirApp(name: string) {
        new S3BucketWithSyncDirApp(this, name);
        return this;
    }

    addS3BucketWithSyncZipContent(name: string) {
        new S3BucketWithZipContentApp(this, name);
        return this;
    }

    addS3BucketWithCORSRules(name: string) {
        new S3BucketWithCORSRulesApp(this, name);
        return this;
    }

}

const app = new MyApp();
app
    // .addWafStack("waf-web-acl")
    // .addCodeBuildProjectApp("codebuild-project")
    // .addLambdaWithCustomRoleApp("lambda-with-custom-role")
    // .addDockerLambdaApp("lambda-with-docker")
    // .addLambdaWithSQSApp("lambda-with-sqs")
    // .addS3BucketWithSyncDirApp("s3-bucket-sync-dir")
    // .addS3BucketWithSyncZipContent("s3-bucket-sync-zip-content")
    .addS3BucketWithCORSRules("s3-bucket-cors-rules")
    .synth();
