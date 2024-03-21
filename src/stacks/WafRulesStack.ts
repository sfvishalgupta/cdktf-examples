import {IWafv2IpSetConfig, S3BackendStack, WAFIPSet, WAFScope} from "arc-cdk";
import {Construct} from "constructs";
import * as Config from "../config";
import {tags} from "../config";
import {getResourceName} from "../utils";

function IPBlackListRule(id: string): IWafv2IpSetConfig {
    return {
        name: getResourceName(id + "-ip-blacklist"),
        scope: WAFScope.REGIONAL,
        ipAddressVersion: "IPV4",
        addresses: ["122.161.74.216/32"],
        description: id + " IP blacklisted",
        tags: {...tags, StackName: id},
        environment: process.env.ENVIRONMENT!,
        namespace: process.env.NAMESPACE!,
    }
}

export class WafRulesStack extends S3BackendStack {
    wafRule: WAFIPSet;

    constructor(scope: Construct, id: string) {
        super(scope, id, Config.getS3BackendConfig(id));
        this.wafRule = new WAFIPSet(this, id + '-waf-ip-set', IPBlackListRule(id));
    }
}
