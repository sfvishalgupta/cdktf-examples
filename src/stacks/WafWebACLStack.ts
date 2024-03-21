import {
    IWafv2IpSetConfig,
    IWafV2WebAclConfig,
    S3BackendStack,
    WAFAggregateKeyType,
    WAFIPSet,
    WAFScope,
    WafWebACL
} from "arc-cdk";
import {Construct} from "constructs";
import * as Config from "../config";
import {tags} from "../config";
import {getResourceName} from "../utils";
import {Wafv2WebAclRule} from "@cdktf/provider-aws/lib/wafv2-web-acl/index-structs";

/**
 * Returns a rate-based WAF rule.
 */
function GetRateBasedWafRule(id: string): Wafv2WebAclRule {
    return {
        name: getResourceName(id + "-rate-based-waf-rule"),
        priority: 2,
        action: {
            block: {},
        },
        statement: {
            rateBasedStatement: {
                // The limit defines the number of requests that are allowed within the specified time period.
                limit: 1000,
                // The aggregate key type determines how the requests are aggregated. In this case, the IP address is used.
                aggregateKeyType: WAFAggregateKeyType.IP,
                // The scope down statement defines the conditions that must be met for the requests to be included in the rule.
                scopeDownStatement: {
                    // The geo match statement defines the countries that are allowed to access the resource.
                    geoMatchStatement: {
                        countryCodes: ["US"],
                    },
                },
            },
        },
        visibilityConfig: {
            // Enables metrics collection for the rule.
            cloudwatchMetricsEnabled: true,
            // The name of the metric.
            metricName: getResourceName("rate-based-waf-rule-metric"),
            // Enables sampling of requests for the rule.
            sampledRequestsEnabled: true,
        },
    };
}

function GetWebACLConfig(id: string, rules: Wafv2WebAclRule[]): IWafV2WebAclConfig {
    return {
        name: getResourceName(id + "-firewall"),
        scope: WAFScope.REGIONAL,
        description: id + " For IP Block",
        defaultAction: {
            allow: {},
        },
        tags: {...tags, StackName: id},
        visibilityConfig: {
            cloudwatchMetricsEnabled: true,
            metricName: getResourceName("Allowed"),
            sampledRequestsEnabled: true,
        },
        rule: [
            GetRateBasedWafRule(id),
            ...rules
        ],
        environment: process.env.ENVIRONMENT!,
        namespace: process.env.NAMESPACE!,
    }
}

function IPBlackListRule(id: string): IWafv2IpSetConfig {
    return {
        name: getResourceName(id + "-ip-blacklist"),
        scope: "REGIONAL",
        ipAddressVersion: "IPV4",
        addresses: ["122.161.74.216/32"],
        description: id + " IP blacklisted",
        tags: {...tags, StackName: id},
        environment: process.env.ENVIRONMENT!,
        namespace: process.env.NAMESPACE!,
    }
}

function GetWebACLIPBlackListRule(id: string, arn: string): Wafv2WebAclRule {
    return {
        name: getResourceName(id + "-ip-blacklist"),
        priority: 1,
        action: {
            block: {},
        },
        statement: {
            ipSetReferenceStatement: {
                arn
            }
        },
        visibilityConfig: {
            cloudwatchMetricsEnabled: true,
            metricName: getResourceName(id + "-BlacklistedIP"),
            sampledRequestsEnabled: true,
        },
    }
}

export class WafWebACLStack extends S3BackendStack {
    private wafRule: WAFIPSet;
    wafWebACL: WafWebACL;

    constructor(scope: Construct, id: string) {
        super(scope, id, Config.getS3BackendConfig(id));
        this.wafRule = new WAFIPSet(this, id + '-waf-ip-set', IPBlackListRule(id));
        const cnf: IWafV2WebAclConfig = GetWebACLConfig(id, [
            GetWebACLIPBlackListRule(id, this.wafRule.ipSet.arn)
        ]);
        this.wafWebACL = new WafWebACL(this, id + cnf.name, cnf);
    }
}