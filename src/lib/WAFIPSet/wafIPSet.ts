import {Construct} from "constructs";
import {Wafv2IpSet} from "@cdktf/provider-aws/lib/wafv2-ip-set";
import {IWafv2IpSetConfig} from "./interface";

export class WAFIPSet extends Construct {
    ipSet: Wafv2IpSet;

    constructor(scope: Construct, id: string, props: IWafv2IpSetConfig) {
        super(scope, id);
        this.ipSet = new Wafv2IpSet(this, id + '-' + props.name, props);
    }
}