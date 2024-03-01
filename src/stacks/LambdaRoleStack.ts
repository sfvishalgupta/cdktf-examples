import {TerraformOutput} from "cdktf";
import {S3BackendStack} from "arc-cdk";
import {Construct} from "constructs";
import * as aws from "@cdktf/provider-aws";
import * as Utils from "../utils";
import * as Config from "../config";

export class LambdaRoleStack extends S3BackendStack {
    /**
     * iam Role created by Stack.
     */
    iamRole: aws.iamRole.IamRole;

    constructor(scope: Construct, id: string, customPolicy: any) {
        super(scope, id, Config.getS3BackendConfig(id));

        const policy = new aws.iamPolicy.IamPolicy(this,
            id + "-iam-policy", {
                name: Utils.getResourceName(id + "-iam-policy"),
                description: "test iam policy for " + id,
                policy: JSON.stringify(customPolicy)
            })

        this.iamRole = new aws.iamRole.IamRole(this, id + "-role", {
            name: Utils.getResourceName(id + "-role"),
            assumeRolePolicy: JSON.stringify(Config.LambdaAssumeRolePolicy),
            managedPolicyArns: [policy.arn]
        });

        new TerraformOutput(this, id + "-arn", {
            value: this.iamRole.arn,
        });
    }
}