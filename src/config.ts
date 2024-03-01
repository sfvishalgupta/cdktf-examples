import {ILambda, ILambdaWithSqs} from "arc-cdk";
import {resolve} from "path";
import {S3BackendConfig} from "cdktf";
import * as aws from "@cdktf/provider-aws";
import * as Utils from "./utils";

require("dotenv").config();
export const LambdaConfig: ILambda = {
    name: process.env.LAMBDA_NAME!,
    s3Bucket: process.env.LAMBDA_S3_BUCKET,
    codePath: resolve(__dirname, '../dist/'),
    handler: 'printEnv.handler',
    runtime: 'nodejs18.x',
    memorySize: 256,
    timeout: 30,
    namespace: process.env.NAMESPACE || '',
    environment: process.env.ENVIRONEMENT || '',
    envVars: {
        "username": "ssm:/erin/poc/aurora/cluster_admin_db_username~true",
        "test": "test"
    },
}

export const LambdaCustomPolicy = {
    Version: "2012-10-17",
    Statement: [{
        Action: "*",
        Effect: "Allow",
        Resource: "*"
    }]
}

export const LambdaAssumeRolePolicy = {
    Version: "2012-10-17",
    Statement: [{
        Action: "sts:AssumeRole",
        Principal: {
            Service: "lambda.amazonaws.com",
        },
        Effect: "Allow",
        Sid: "",
    }],
}

export const LambdaWithSQSConfig: ILambdaWithSqs = {
    kmsMasterKeyId: process.env.KMS_KEY_ID!,
    kmsDataKeyReusePeriodSeconds: 300,
    delaySeconds: 600, //The time in seconds for which the delivery of all messages in the queue is delayed.
    maxMessageSize: 2048, //The limit of how many bytes that a message can contain before Amazon SQS rejects it.
    messageRetentionSeconds: 60, //The number of seconds that Amazon SQS retains a message.
    receiveWaitTimeSeconds: 20, // Specifies the duration, in seconds, that the ReceiveMessage action call waits until a message is in the queue in order to include it in the response,
    batchSize: 10,
    maxReceiveCount: 10,

    name: process.env.LAMBDA_WITH_SQS_NAME!,
    s3Bucket: process.env.LAMBDA_S3_BUCKET,
    codePath: resolve(__dirname, '../dist/'),
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
}

export function getS3BackendConfig(id: string): S3BackendConfig {
    return {
        bucket: process.env.BACKEND_TERRAFORM_BUCKET!,
        key: "stacks/" + id + ".tfstate",
        region: process.env.AWS_REGION,
        encrypt: true
    }
}

export function getVPCConfig(id: string): aws.vpc.VpcConfig {
    return {
        cidrBlock: process.env.VPC_CIDR,
        tags: {
            "Name": Utils.getResourceName(id)
        }
    }
}

export function getSecurityGroupConfig(vpcId: string, id: string): aws.securityGroup.SecurityGroupConfig {
    return {
        vpcId: vpcId,
        tags: {
            "Name": Utils.getResourceName(id)
        },
        ingress: [{
            fromPort: 0,
            toPort: 0,
            protocol: '-1',
            cidrBlocks: ['0.0.0.0/0'],
            description: "cdktf ingress rule"
        }],
        egress: [{
            fromPort: 0,
            toPort: 0,
            protocol: '-1',
            cidrBlocks: ['0.0.0.0/0'],
            description: "cdktf egress rule"
        }]
    }
}