import {S3BackendStack} from "arc-cdk";
import * as aws from "@cdktf/provider-aws"
import {Construct} from "constructs";
import * as Config from "../config";
import {Wafv2WebAclConfig} from "@cdktf/provider-aws/lib/wafv2-web-acl";
import {TerraformOutput} from "cdktf";


export class WafWebACLStack extends S3BackendStack {
    webACL: aws.wafv2WebAcl.Wafv2WebAcl;

    constructor(scope: Construct, id: string, config: Wafv2WebAclConfig) {
        super(scope, id, Config.getS3BackendConfig(id));
        this.webACL = new aws.wafv2WebAcl.Wafv2WebAcl(
            this, id + config.name,
            config
        );

        new TerraformOutput(this, id + '-web-acl-arn', {
            value: this.webACL.arn
        });
    }
}