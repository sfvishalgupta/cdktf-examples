import {Wafv2WebAclConfig} from "@cdktf/provider-aws/lib/wafv2-web-acl";
import {Wafv2WebAclRule} from "@cdktf/provider-aws/lib/wafv2-web-acl/index-structs";
import {IWafv2IpSetConfig} from "../WAFIPSet/interface";

export interface ipBlackListRule {
    IPSetConfig: IWafv2IpSetConfig,
    WebAclConfig: Wafv2WebAclRule
}
export interface IWafV2WebAclConfig extends Wafv2WebAclConfig {
    ipBlackListRules?: ipBlackListRule[];
    rule: Wafv2WebAclRule[];
}