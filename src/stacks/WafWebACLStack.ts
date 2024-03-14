import {S3BackendStack} from "arc-cdk";
import {Construct} from "constructs";
import * as Config from "../config";
import {IWafV2WebAclConfig, WAFIPSet, WafWebACL} from "../lib"

export class WafWebACLStack extends S3BackendStack {
    private wafRule: WAFIPSet;
    wafWebACL: WafWebACL;

    constructor(scope: Construct, id: string) {
        super(scope, id, Config.getS3BackendConfig(id));
        this.wafRule = new WAFIPSet(this, id + '-waf-ip-set', Config.IPBlackListRule(id));
        const cnf: IWafV2WebAclConfig = Config.GetWebACLConfig(id, [
            Config.GetWebACLIPBlackListRule(id, this.wafRule.ipSet.arn)
        ]);
        this.wafWebACL = new WafWebACL(this, id + cnf.name, cnf);
    }
}