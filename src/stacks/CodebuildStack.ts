import {Construct} from "constructs";
import {S3BackendStack} from "arc-cdk";
import * as Config from "../config";
import {TerraformOutput} from "cdktf";
import {Codebuild, ICodebuildProjectConfig} from "../lib"
import {GetCodeBuildConfig} from "../config";

require("dotenv").config();

export class CodebuildStack extends S3BackendStack {
    /**
     * Codebuild Resource
     */
    codebuildProject: Codebuild

    constructor(scope: Construct, id: string) {
        super(scope, id, Config.getS3BackendConfig(id));
        const props: ICodebuildProjectConfig = Config.GetCodeBuildConfig(id)
        this.codebuildProject = new Codebuild(this, "code-build", props);
        new TerraformOutput(this, id + "-arn", {
            value: this.codebuildProject.CodebuildProject.arn,
        });
    }
}