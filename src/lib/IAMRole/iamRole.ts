import {Construct} from "constructs";
import {IamRole} from "@cdktf/provider-aws/lib/iam-role";
import {IamPolicy} from "@cdktf/provider-aws/lib/iam-policy";
import {IIAMRole} from "./interface";

export class IAMRole extends Construct {
    iamRole: IamRole;
    private managedPolicyArns: string[] = [];

    constructor(scope: Construct, id: string, config: IIAMRole) {
        super(scope, id);
        if (config.iamPolicyConfig) {
            const policy = new IamPolicy(this, id + "-iam-policy", config.iamPolicyConfig)
            this.managedPolicyArns.push(policy.arn)
        }
        config.iamRoleConfig.managedPolicyArns = this.managedPolicyArns;
        this.iamRole = new IamRole(this, id + "-role", config.iamRoleConfig);
    }
}