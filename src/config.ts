import {
    APIGatewayAuthorizer,
    APIGatewayEndPointType,
    APIGatewayHTTPMethod,
    APIGatewayLoggingLevel,
    ILambda,
    ILambdaWithApiGateway,
    IRestAPIGatewayConfig
} from "arc-cdk";
import {SecurityGroupConfig} from "@cdktf/provider-aws/lib/security-group";
import {VpcConfig} from "@cdktf/provider-aws/lib/vpc";
import {S3BucketCorsConfigurationCorsRule} from "@cdktf/provider-aws/lib/s3-bucket-cors-configuration";
import {S3BucketConfig} from "@cdktf/provider-aws/lib/s3-bucket";
import {resolve} from "path";
import {S3BackendConfig} from "cdktf";

import {IAdvancedLambda} from "./interfaces";
import * as listCats from "./schema/listCats.json";
import * as Utils from "./utils";

require("dotenv").config();
export const tags: { [key: string]: string } = {
    Team: 'ARC Team',
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
            Service: ["lambda.amazonaws.com", "apigateway.amazonaws.com"]
        },
        Effect: "Allow",
        Sid: "",
    }],
}
export const LambdaWithCodeInS3Config: ILambda = {
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
export const lambdaWithApiGatewayConfig: ILambdaWithApiGateway = {
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


/**
 * Returns a VPC configuration.
 * @param id - the ID of the VPC
 */
export function getVPCConfig(id: string): VpcConfig {
    return {
        cidrBlock: process.env.VPC_CIDR,
        tags: {
            "Name": Utils.getResourceName(id),
        },
    };
}


/**
 * Returns a security group configuration.
 * @param vpcId - the ID of the VPC to create the security group in
 * @param id - the ID of the security group
 */
export function getSecurityGroupConfig(vpcId: string, id: string): SecurityGroupConfig {
    return {
        vpcId,
        tags: {
            Name: Utils.getResourceName(id),
        },
        ingress: [{
            fromPort: 0,
            toPort: 0,
            protocol: '-1',
            cidrBlocks: ['0.0.0.0/0'],
            description: 'cdktf ingress rule',
        }],
        egress: [{
            fromPort: 0,
            toPort: 0,
            protocol: '-1',
            cidrBlocks: ['0.0.0.0/0'],
            description: 'cdktf egress rule',
        }],
    };
}

/**
 * Returns an S3 bucket configuration.
 */
export function GetS3BucketConfig(): S3BucketConfig {
    return {
        /**
         * the name of the S3 bucket
         */
        bucket: `${process.env.BUCKET_STACK_BUCKET}`,
        /**
         * whether to destroy the S3 bucket and all its contents when the stack is deleted
         */
        forceDestroy: true,
        /**
         * tags to apply to the S3 bucket
         */
        tags: tags
    }
}

/**
 * Returns a Terraform backend configuration for S3.
 * @param id - the ID of the Terraform state
 */
export function getS3BackendConfig(id: string): S3BackendConfig {
    return {
        /**
         * the name of the S3 bucket
         */
        bucket: process.env.BACKEND_TERRAFORM_BUCKET!,
        /**
         * the path to the Terraform state file within the S3 bucket
         */
        key: `stacks/${id}.tfstate`,
        /**
         * the AWS region where the S3 bucket is located
         */
        region: process.env.AWS_REGION,
        /**
         * whether to enable server-side encryption of the Terraform state
         */
        encrypt: true,
    };
}


export function GetApiGatewayConfigVersioning(lambdaFn: string): IRestAPIGatewayConfig {
    return {
        environment: process.env.ENVIRONMENT!,
        namespace: process.env.NAMESPACE!,
        name: "MyRestAPIGatewayVersioning",
        region: process.env.region!,
        type: APIGatewayEndPointType.REGIONAL,
        tags: tags,
        description: "Created by cdktf versioning",
        stageName: "prod",
        loggingLevel: APIGatewayLoggingLevel.OFF,
        proxyIntegrations: [{
            name: "Version1",
            path: "Version1",
            methods: [{
                name: "listCats",
                authorization: APIGatewayAuthorizer.NONE,
                method: APIGatewayHTTPMethod.GET,
                lambdaName: lambdaFn! + ":Versioning1",
                apiKeyRequired: false,
                schema: JSON.stringify(listCats)
            }],
        }, {
            name: "Version2",
            path: "Version2",
            methods: [{
                name: "listDogs",
                authorization: APIGatewayAuthorizer.NONE,
                method: APIGatewayHTTPMethod.GET,
                lambdaName: lambdaFn! + ":Versioning2",
                apiKeyRequired: false,
                schema: JSON.stringify(listCats)
            }],
        }]
    }
}

/**
 * Returns a Lambda configuration.
 * @param id
 * @param lambdaName
 * @param roleArn - the ARN of the IAM role to attach to the Lambda function
 */
export function GetLambdaConfig(id: string, lambdaName: string, roleArn: string): IAdvancedLambda {
    return {
        name: lambdaName,
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
        tags: {...tags, StackName: id},
        roleArn,
    }
}

/**
 * Returns a Lambda configuration.
 * @param roleArn - the ARN of the IAM role to attach to the Lambda function
 */
export function GetLambdaWithVersioningConfig(roleArn: string): IAdvancedLambda {
    return {
        name: `${process.env.LAMBDA_NAME}-with-versioning`,
        codePath: resolve(__dirname, '../dist/'),
        handler: 'versioningLambda.handler',
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
        roleArn,
        enableAlias: true,
        aliasName: "Versioning2",
        aliasVersion: "$LATEST",
    };
}
