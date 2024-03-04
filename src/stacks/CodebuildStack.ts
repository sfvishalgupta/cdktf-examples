import {Construct} from "constructs";
import {S3BackendStack} from "arc-cdk";
import * as aws from "@cdktf/provider-aws"
import * as Config from "../config";
import {TerraformOutput} from "cdktf";

require("dotenv").config();

export class CodebuildStack extends S3BackendStack {
    /**
     * Codebuild Resource
     */
    codebuildProject: aws.codebuildProject.CodebuildProject

    constructor(scope: Construct, id: string, config: aws.codebuildProject.CodebuildProjectConfig) {
        super(scope, id, Config.getS3BackendConfig(id));
        this.codebuildProject = new aws.codebuildProject.CodebuildProject(this, "cb", config);
        new TerraformOutput(this, id + "-arn", {
            value: this.codebuildProject.arn,
        });
    }
}