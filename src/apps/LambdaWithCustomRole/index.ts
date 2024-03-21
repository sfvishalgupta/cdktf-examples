import {App} from "cdktf";
import {BasicLambdaStack, IAMRoleStack} from "../../stacks";
import {resolve} from "path";
import {tags} from "../../config";

export class LambdaWithCustomRoleApp {
    private lambdaWithCustomRole: BasicLambdaStack;

    constructor(app: App, name: string, enableAPI?: boolean) {
        const roleStack: IAMRoleStack = new IAMRoleStack(app, name + '-role');
        this.lambdaWithCustomRole = new BasicLambdaStack(app, name + '-lambda', {
            name,
            codePath: resolve(__dirname, './dist/'),
            handler: 'printEnv.handler',
            runtime: 'nodejs18.x',
            memorySize: 256,
            timeout: 30,
            namespace: process.env.NAMESPACE || '',
            environment: process.env.ENVIRONMENT || '',
            envVars: {
                "test": "test"
            },
            tags: {...tags, StackName: name},
            roleArn: roleStack.iamRoleARN,
        });
    }
}