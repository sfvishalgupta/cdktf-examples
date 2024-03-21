import {Construct} from "constructs";
import {Codebuild, ICodebuildProjectConfig, S3BackendStack} from "arc-cdk";
import * as Config from "../config";
import {TerraformOutput} from "cdktf";

export class CodebuildStack extends S3BackendStack {
    /**
     * Codebuild Resource
     */
    codebuildProject: Codebuild

    constructor(scope: Construct, id: string, props: ICodebuildProjectConfig) {
        super(scope, id, Config.getS3BackendConfig(id));
        this.codebuildProject = new Codebuild(this, "code-build", props);
        new TerraformOutput(this, id + "-arn", {
            value: this.codebuildProject.codebuildProject.arn,
        });
    }
}