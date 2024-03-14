import {IamPolicyConfig} from "@cdktf/provider-aws/lib/iam-policy";
import {IamRoleConfig} from "@cdktf/provider-aws/lib/iam-role";

export interface  IIAMRole {
    iamPolicyConfig?: IamPolicyConfig,
    iamRoleConfig: any
}