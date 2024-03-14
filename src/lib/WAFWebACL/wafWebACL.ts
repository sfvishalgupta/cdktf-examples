import {Construct} from "constructs";
import {Wafv2WebAcl} from "@cdktf/provider-aws/lib/wafv2-web-acl";
import {IWafV2WebAclConfig} from "./interface"

export class WafWebACL extends Construct {
    WafWebACL: Wafv2WebAcl;

    constructor(scope: Construct, id: string, config: IWafV2WebAclConfig) {
        super(scope, id);
        const cnf: Omit<IWafV2WebAclConfig, 'ipBlackListRule'> = config;
        this.WafWebACL = new Wafv2WebAcl(this, id + config.name, cnf);
    }
}