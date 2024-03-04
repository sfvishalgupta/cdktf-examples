import {ILambda, ILambdaWithApiGateway, ILambdaWithSqs} from "arc-cdk";
import {resolve} from "path";
import {S3BackendConfig} from "cdktf";
import * as aws from "@cdktf/provider-aws";
import * as Utils from "./utils";

require("dotenv").config();

export const tags = {
    Team: 'CDK Team',
    Company: 'Testing ',
    Environment: process.env.ENVIRONMENT!,
    Namespace: process.env.NAMESPACE!
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
export  const LambdaWithCodeInS3Config: ILambda = {
    name: `${process.env.LAMBDA_NAME}-with-code-in-s3`,
    codePath: resolve(__dirname, '../dist/'),
    // s3Key: "",
    s3Bucket: "",
    handler: 'printEnv.handler',
    runtime: 'nodejs18.x',
    memorySize: 256,
    timeout: 6,
    namespace: process.env.NAMESPACE || '',
    environment: process.env.ENVIRONMENT || '',
    publish: true,
    envVars: {
        "username": "ssm:/erin/poc/aurora/cluster_admin_db_username~true",
        "test": "test"
    },
    tags,
}

export const LambdaWithVersioningConfig: ILambda={
    name: `${process.env.LAMBDA_NAME}-with-versioning`,
    codePath: resolve(__dirname, '../dist/'),
    handler: 'printEnv.handler',
    runtime: 'nodejs18.x',
    memorySize: 256,
    timeout: 6,
    namespace: process.env.NAMESPACE || '',
    environment: process.env.ENVIRONMENT || '',
    publish: true,
    envVars: {
        "username": "ssm:/erin/poc/aurora/cluster_admin_db_username~true",
        "test": "test"
    },
    tags,
}

export const lambdaWithApiGatewayConfig: ILambdaWithApiGateway={
    name: `${process.env.LAMBDA_NAME}-with-api-gateway`,
    codePath: resolve(__dirname, '../dist/'),
    handler: 'printEnv.handler',
    runtime: 'nodejs18.x',
    memorySize: 256,
    timeout: 6,
    namespace: process.env.NAMESPACE || '',
    environment: process.env.ENVIRONMENT || '',
    publish: true,
    envVars: {
        "username": "ssm:/erin/poc/aurora/cluster_admin_db_username~true",
        "test": "test"
    },
    tags,
}

export const LambdaConfig: ILambda = {
    name: process.env.LAMBDA_NAME!,
    codePath: resolve(__dirname, '../dist/'),
    handler: 'printEnv.handler',
    runtime: 'nodejs18.x',
    memorySize: 256,
    timeout: 30,
    namespace: process.env.NAMESPACE || '',
    environment: process.env.ENVIRONMENT || '',
    envVars: {
        "username": "ssm:/erin/poc/aurora/cluster_admin_db_username~true",
        "test": "test"
    },
    tags,
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
    tags
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

export const CodeBuildConfig: aws.codebuildProject.CodebuildProjectConfig = {
    name: Utils.getResourceName("code-build"),
    description: "My Codebuild Project created by CDKTF",
    buildTimeout: 60,
    serviceRole: process.env.SERVICE_ROLE!,
    source: {
        type: "S3",
        location: process.env.SOURCE_BUCKET + process.env.SOURCE_FILE!,
    },
    artifacts: {
        type: "NO_ARTIFACTS"
    },
    environment: {
        computeType: "BUILD_GENERAL1_SMALL",
        image: "aws/codebuild/amazonlinux2-x86_64-standard:5.0",
        type: "LINUX_CONTAINER",
        environmentVariable: [{
            name: "TARGET_ACCOUNT_REGION",
            value: process.env.TARGET_ACCOUNT_REGION!
        }, {
            name: "TARGET_ACCOUNT_ACCESS_KEY",
            value: process.env.TARGET_ACCOUNT_ACCESS_KEY!
        }, {
            name: "TARGET_ACCOUNT_SECRET_KEY",
            value: process.env.TARGET_ACCOUNT_SECRET_KEY!
        }, {
            name: "SOURCE_ACCOUNT_REGION",
            value: process.env.SOURCE_ACCOUNT_REGION!
        }, {
            name: "SOURCE_ACCOUNT_ACCESS_KEY",
            value: process.env.SOURCE_ACCOUNT_ACCESS_KEY!
        }, {
            name: "SOURCE_ACCOUNT_SECRET_KEY",
            value: process.env.SOURCE_ACCOUNT_SECRET_KEY!
        }, {
            name: "DB_ENDPOINT",
            value: process.env.DB_ENDPOINT!
        }, {
            name: "DB_USERNAME",
            value: process.env.DB_USERNAME!
        }, {
            name: "DB_PASSWORD",
            value: process.env.DB_PASSWORD!
        }]
    },
    tags,
    // Optional
    vpcConfig: {
        vpcId: process.env.VPC_ID!,
        subnets: process.env.SUBNETS?.split(",")! || [],
        securityGroupIds: process.env.SECURITY_GROUP_IDS?.split(",") || []
    }
}

export const corsRules: aws.s3BucketCorsConfiguration.S3BucketCorsConfigurationCorsRule[] = [{
    allowedMethods: ["GET"],
    allowedOrigins: ["*"],
}, {
    allowedHeaders: ['*'],
    allowedMethods: ["PUT", "POST"],
    allowedOrigins: ["https://s3-website-test.hashicorp.com"],
    maxAgeSeconds: 3000,
    exposeHeaders: ["ETag"],
}];


export function getS3BucketConfig(): aws.s3Bucket.S3BucketConfig {
    return {
        bucket: `${process.env.BUCKET_STACK_BUCKET}`,
        forceDestroy: true,
        tags: tags
    }
}