import {S3BackendStack} from "arc-cdk";
import {Construct} from "constructs";
import * as Config from "../config";
import {WAFIPSet} from "../lib";

export class WafRulesStack extends S3BackendStack {
    wafRule: WAFIPSet;

    constructor(scope: Construct, id: string) {
        super(scope, id, Config.getS3BackendConfig(id));
        this.wafRule = new WAFIPSet(this, id + '-waf-ip-set', Config.IPBlackListRule(id));
    }
}
