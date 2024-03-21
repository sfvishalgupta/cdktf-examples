import {App} from "cdktf";
import {tags} from "../../config";
import {LambdaWithSQSStack} from "../../stacks";
import {ILambdaWithSqs} from "arc-cdk";
import {resolve} from "path";

function GetLambdaWithSQSConfig(name:string): ILambdaWithSqs {
    return {
        kmsMasterKeyId: process.env.KMS_KEY_ID!,
        kmsDataKeyReusePeriodSeconds: 300,
        delaySeconds: 600, //The time in seconds for which the delivery of all messages in the queue is delayed.
        maxMessageSize: 2048, //The limit of how many bytes that a message can contain before Amazon SQS rejects it.
        messageRetentionSeconds: 60, //The number of seconds that Amazon SQS retains a message.
        receiveWaitTimeSeconds: 20, // Specifies the duration, in seconds, that the ReceiveMessage action call waits until a message is in the queue in order to include it in the response,
        batchSize: 10,
        maxReceiveCount: 10,

        name,
        codePath: resolve(__dirname, './dist/'),
        handler: 'printEnv.handler',
        runtime: 'nodejs18.x',
        memorySize: 256,
        timeout: 15,
        namespace: process.env.NAMESPACE || '',
        environment: process.env.ENV || '',
        envVars: {
            "username": "ssm:/erin/poc/aurora/cluster_admin_db_username~true",
            "test": "test"
        },
        tags
    }
}

export class LambdaWithSQSApp {
    constructor(app: App, name: string) {
        const lambdaWithSQSConfig: any = GetLambdaWithSQSConfig(name);
        new LambdaWithSQSStack(app, name, lambdaWithSQSConfig);
    }
}