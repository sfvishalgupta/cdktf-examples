import {Construct} from "constructs";
import {CodebuildProject} from "@cdktf/provider-aws/lib/codebuild-project"
import {ICodebuildProjectConfig} from "./interface"

export class Codebuild extends Construct {
    /**
     * Codebuild Resource
     */
    CodebuildProject: CodebuildProject

    constructor(scope: Construct, id: string, props: ICodebuildProjectConfig) {
        super(scope, id);
        this.CodebuildProject = new CodebuildProject(this, "cb", props);
    }
}