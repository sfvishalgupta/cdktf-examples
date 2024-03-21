import {TerraformOutput} from "cdktf";
import {S3BackendStack, IAMRole, IIamRole} from "arc-cdk";
import {Construct} from "constructs";
import * as Config from "../config";
import * as Utils from "../utils";

export class IAMRoleStack extends S3BackendStack {
    iamRoleARN: string;

    constructor(scope: Construct, id: string) {
        super(scope, id, Config.getS3BackendConfig(id));
        const config: IIamRole = {
            environment: process.env.ENVIRONMENT!,
            namespace: process.env.NAMESPACE!,
            iamPolicyConfig: {
                name: Utils.getResourceName(id + "-iam-policy"),
                description: "test iam policy for " + id,
                policy: JSON.stringify(Config.LambdaCustomPolicy),
                tags: {...Config.tags, StackName: id}
            },
            iamRoleConfig: {
                name: Utils.getResourceName(id + "-role"),
                assumeRolePolicy: JSON.stringify(Config.LambdaAssumeRolePolicy),
                tags: {...Config.tags, StackName: id}
            },
            tags: {...Config.tags, StackName: id}
        }
        const iamRole: IAMRole = new IAMRole(this, id + "iamRole", config);
        this.iamRoleARN = iamRole.iamRole.arn;
        new TerraformOutput(this, id + "-arn", {
            value: this.iamRoleARN,
        });
    }
}