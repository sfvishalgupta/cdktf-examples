import {S3BackendStack} from "arc-cdk";
import * as aws from "@cdktf/provider-aws"
import {Construct} from "constructs";
import * as Config from "../config";
import {Wafv2IpSetConfig} from "@cdktf/provider-aws/lib/wafv2-ip-set";

export class WafRulesStack extends S3BackendStack {
    ipSet: aws.wafv2IpSet.Wafv2IpSet;

    constructor(scope: Construct, id: string, ruleConfig: Wafv2IpSetConfig) {
        super(scope, id, Config.getS3BackendConfig(id));
        this.ipSet = new aws.wafv2IpSet.Wafv2IpSet(
            this,
            id + '-' + ruleConfig.name,
            ruleConfig
        );
    }
}
