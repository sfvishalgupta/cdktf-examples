import {Construct} from "constructs";
import {Codebuild, ICodebuildProjectConfig, S3BackendStack} from "arc-cdk";
import * as Config from "../config";
import {tags} from "../config";
import {TerraformOutput} from "cdktf";
import * as Utils from "../utils";

require("dotenv").config();


function GetCodeBuildConfig(id: string): ICodebuildProjectConfig {
    return {
        namespace: process.env.NAMESPACE!,
        name: Utils.getResourceName(id + "-code-build"),
        description: "My Codebuild Project created by CDKTF",
        buildTimeout: 60,
        serviceRole: process.env.SERVICE_ROLE!,
        source: {
            type: "S3",
            location: process.env.SOURCE_BUCKET + process.env.SOURCE_FILE!,
        },
        artifacts: {
            type: "NO_ARTIFACTS"
        },
        environment: {
            computeType: "BUILD_GENERAL1_SMALL",
            image: "aws/codebuild/amazonlinux2-x86_64-standard:5.0",
            type: "LINUX_CONTAINER",
            environmentVariable: [{
                name: "TARGET_ACCOUNT_REGION",
                value: process.env.TARGET_ACCOUNT_REGION!
            }, {
                name: "TARGET_ACCOUNT_ACCESS_KEY",
                value: process.env.TARGET_ACCOUNT_ACCESS_KEY!
            }, {
                name: "TARGET_ACCOUNT_SECRET_KEY",
                value: process.env.TARGET_ACCOUNT_SECRET_KEY!
            }, {
                name: "SOURCE_ACCOUNT_REGION",
                value: process.env.SOURCE_ACCOUNT_REGION!
            }, {
                name: "SOURCE_ACCOUNT_ACCESS_KEY",
                value: process.env.SOURCE_ACCOUNT_ACCESS_KEY!
            }, {
                name: "SOURCE_ACCOUNT_SECRET_KEY",
                value: process.env.SOURCE_ACCOUNT_SECRET_KEY!
            }, {
                name: "DB_ENDPOINT",
                value: process.env.DB_ENDPOINT!
            }, {
                name: "DB_USERNAME",
                value: process.env.DB_USERNAME!
            }, {
                name: "DB_PASSWORD",
                value: process.env.DB_PASSWORD!
            }]
        },
        tags,
        // Optional
        vpcConfig: {
            vpcId: process.env.VPC_ID!,
            subnets: process.env.SUBNETS?.split(",")! || [],
            securityGroupIds: process.env.SECURITY_GROUP_IDS?.split(",") || []
        }
    }
}

export class CodebuildStack extends S3BackendStack {
    /**
     * Codebuild Resource
     */
    codebuildProject: Codebuild

    constructor(scope: Construct, id: string) {
        super(scope, id, Config.getS3BackendConfig(id));
        const props: ICodebuildProjectConfig = GetCodeBuildConfig(id)
        this.codebuildProject = new Codebuild(this, "code-build", props);
        new TerraformOutput(this, id + "-arn", {
            value: this.codebuildProject.codebuildProject.arn,
        });
    }
}