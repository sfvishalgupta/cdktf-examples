import {App} from "cdktf";
import * as Stacks from "./stacks";
import * as Config from "./config";
import {ILambda} from "arc-cdk";

require("dotenv").config();

const app = new App();

/** Iam Role Stack */
const IamRoleStack: Stacks.LambdaRoleStack = new Stacks.LambdaRoleStack(
    app,
    "MyLambdaRoleStack",
    Config.LambdaCustomPolicy
);

const vpcStack: Stacks.VPCStack = new Stacks.VPCStack(
    app,
    "MyVPCStack",
    Config.getVPCConfig("vpc")
);

/** Lambda Stack */
const lambdaConfig: any = Config.LambdaConfig;
lambdaConfig.roleArn = IamRoleStack.iamRole!.arn;
lambdaConfig.vpcConfig = {
    securityGroupIds: [vpcStack.securityGroup.id],
    subnetIds: [
        vpcStack.publicSubnet1.id,
        vpcStack.publicSubnet2.id,
        vpcStack.privateSubnet1.id,
        vpcStack.privateSubnet2.id
    ]
}
new Stacks.LambdaStack(app, "MyLambdaStack", lambdaConfig);

/** Lambda With SQS Stack **/
const lambdaWithSQSConfig: any = Config.LambdaWithSQSConfig;
lambdaWithSQSConfig.roleArn = IamRoleStack.iamRole!.arn;
lambdaWithSQSConfig.vpcConfig = {
    securityGroupIds: [vpcStack.securityGroup.id],
    subnetIds: [
        vpcStack.publicSubnet1.id,
        vpcStack.publicSubnet2.id,
        vpcStack.privateSubnet1.id,
        vpcStack.privateSubnet2.id
    ]
}
new Stacks.LambdaWithSQS(app, 'MyLambdaWithSQSStack', lambdaWithSQSConfig);
app.synth();
