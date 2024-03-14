import {ILambda, ILambdaWithApiGateway, ILambdaWithSqs} from "arc-cdk";
import {Wafv2WebAclRule} from "@cdktf/provider-aws/lib/wafv2-web-acl/index-structs";
import {SecurityGroupConfig} from "@cdktf/provider-aws/lib/security-group";
import {VpcConfig} from "@cdktf/provider-aws/lib/vpc";
import {S3BucketCorsConfigurationCorsRule} from "@cdktf/provider-aws/lib/s3-bucket-cors-configuration";
import {S3BucketConfig} from "@cdktf/provider-aws/lib/s3-bucket";
import {resolve} from "path";
import {S3BackendConfig} from "cdktf";

import {IAdvancedLambda} from "./interfaces";
import * as listCats from "./schema/listCats.json";
import * as Utils from "./utils";
import {getResourceName} from "./utils";
import {
    APIGateway_Authorizer,
    APIGateway_EndPointType,
    APIGateway_HTTPMethod,
    APIGateway_LoggingLevel,
    ICodebuildProjectConfig,
    IRestAPIGatewayConfig,
    IWafv2IpSetConfig,
    IWafV2WebAclConfig,
    WAF_AGGREGATE_KEY_TYPE,
    WAF_SCOPE
} from "./lib";

require("dotenv").config();
export const tags: { [key: string]: string } = {
    Team: 'ARC Team',
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

export function GetCodeBuildConfig(id: string): ICodebuildProjectConfig {
    return {
        name: Utils.getResourceName(id + "-code-build"),
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

export const corsRules: S3BucketCorsConfigurationCorsRule[] = [{
    allowedMethods: [APIGateway_HTTPMethod.GET],
    allowedOrigins: ["*"],
}, {
    allowedHeaders: ['*'],
    allowedMethods: [APIGateway_HTTPMethod.PUT, APIGateway_HTTPMethod.POST],
    allowedOrigins: ["https://s3-website-test.hashicorp.com"],
    maxAgeSeconds: 3000,
    exposeHeaders: ["ETag"],
}];

export function IPBlackListRule(id: string): IWafv2IpSetConfig {
    return {
        name: getResourceName(id + "-ip-blacklist"),
        scope: WAF_SCOPE.REGIONAL,
        ipAddressVersion: "IPV4",
        addresses: ["122.161.74.216/32"],
        description: id + " IP blacklisted",
        tags: {...tags, StackName: id}
    }
}

export function GetWebACLIPBlackListRule(id: string, arn: string): Wafv2WebAclRule {
    return {
        name: getResourceName(id + "-ip-blacklist"),
        priority: 1,
        action: {
            block: {},
        },
        statement: {
            ipSetReferenceStatement: {
                arn
            }
        },
        visibilityConfig: {
            cloudwatchMetricsEnabled: true,
            metricName: getResourceName(id + "-BlacklistedIP"),
            sampledRequestsEnabled: true,
        },
    }
}

/**
 * Returns a rate-based WAF rule.
 */
export function GetRateBasedWafRule(id: string): Wafv2WebAclRule {
    return {
        name: getResourceName(id + "-rate-based-waf-rule"),
        priority: 2,
        action: {
            block: {},
        },
        statement: {
            rateBasedStatement: {
                // The limit defines the number of requests that are allowed within the specified time period.
                limit: 1000,
                // The aggregate key type determines how the requests are aggregated. In this case, the IP address is used.
                aggregateKeyType: WAF_AGGREGATE_KEY_TYPE.IP,
                // The scope down statement defines the conditions that must be met for the requests to be included in the rule.
                scopeDownStatement: {
                    // The geo match statement defines the countries that are allowed to access the resource.
                    geoMatchStatement: {
                        countryCodes: ["US"],
                    },
                },
            },
        },
        visibilityConfig: {
            // Enables metrics collection for the rule.
            cloudwatchMetricsEnabled: true,
            // The name of the metric.
            metricName: getResourceName("rate-based-waf-rule-metric"),
            // Enables sampling of requests for the rule.
            sampledRequestsEnabled: true,
        },
    };
}

export function GetWebACLConfig(id: string, rules: Wafv2WebAclRule[]): IWafV2WebAclConfig {
    return {
        name: getResourceName(id + "-firewall"),
        scope: WAF_SCOPE.REGIONAL,
        description: id + " For IP Block",
        defaultAction: {
            allow: {},
        },
        tags: {...tags, StackName: id},
        visibilityConfig: {
            cloudwatchMetricsEnabled: true,
            metricName: getResourceName("Allowed"),
            sampledRequestsEnabled: true,
        },
        rule: [
            GetRateBasedWafRule(id),
            ...rules
        ],
    }
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

/**
 * Returns an API Gateway configuration for a REST API with a single endpoint that invokes the specified Lambda function.
 * @param id
 * @param lambdaFn - the name of the Lambda function to invoke
 * @param webAclArn
 */
export function GetApiGatewayConfig(id: string, lambdaFn: string, webAclArn?: string): IRestAPIGatewayConfig {
    return {
        name: "print-lambda",
        region: process.env.region!,
        type: APIGateway_EndPointType.REGIONAL,
        tags: {...tags, StackName: id},
        description: "Created by cdktf",
        stageName: "prod",
        webAclArn,
        dataTraceEnabled: false,
        loggingLevel: APIGateway_LoggingLevel.OFF,
        throttlingBurstLimit: -1,
        throttlingRateLimit: -1,
        proxyIntegrations: [{
            name: "Cats",
            path: "cats",
            methods: [{
                name: "listCats",
                authorization: APIGateway_Authorizer.NONE,
                method: APIGateway_HTTPMethod.GET,
                lambdaName: lambdaFn!,
                apiKeyRequired: false,
                schema: JSON.stringify(listCats),
                alias: "$latest"
            }, {
                name: "createCat",
                authorization: APIGateway_Authorizer.NONE,
                method: APIGateway_HTTPMethod.POST,
                lambdaName: lambdaFn,
                apiKeyRequired: false,
                schema: JSON.stringify(listCats)
            }],
        }, {
            name: "Dogs",
            path: "dogs",
            methods: [{
                name: "listDogs",
                authorization: APIGateway_Authorizer.NONE,
                method: APIGateway_HTTPMethod.GET,
                lambdaName: lambdaFn!,
                apiKeyRequired: false,
                schema: JSON.stringify(listCats),
                alias: "$latest"
            }],
        }]
    }
}

export function GetApiGatewayConfigVersioning(lambdaFn: string): IRestAPIGatewayConfig {
    return {
        name: "MyRestAPIGatewayVersioning",
        region: process.env.region!,
        type: APIGateway_EndPointType.REGIONAL,
        tags: tags,
        description: "Created by cdktf versioning",
        stageName: "prod",
        loggingLevel: APIGateway_LoggingLevel.OFF,
        proxyIntegrations: [{
            name: "Version1",
            path: "Version1",
            methods: [{
                name: "listCats",
                authorization: APIGateway_Authorizer.NONE,
                method: APIGateway_HTTPMethod.GET,
                lambdaName: lambdaFn! + ":Versioning1",
                apiKeyRequired: false,
                schema: JSON.stringify(listCats)
            }],
        }, {
            name: "Version2",
            path: "Version2",
            methods: [{
                name: "listDogs",
                authorization: APIGateway_Authorizer.NONE,
                method: APIGateway_HTTPMethod.GET,
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
