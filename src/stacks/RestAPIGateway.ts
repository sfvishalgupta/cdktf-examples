import {S3BackendStack} from "arc-cdk";
import * as Config from "../config";
import {Construct} from "constructs";
import * as aws from "@cdktf/provider-aws"
import {TerraformOutput} from "cdktf";
import * as Utils from "../utils";

interface iProxyIntegration {
    name: string
    path: string
    authorization: string
    method: string
    lambdaName: string
    apiKeyRequired?: boolean,
    schema?: string
}

interface IRestAPIGatewayConfig {
    region: string;
    accountId: string;
    name: string;
    type: string;
    description: string;
    tags: { [key: string]: string };
    proxyIntegrations: [iProxyIntegration];
    webAclArn?: string;
}

export const enum Authorizer {
    AWS_IAM = "AWS_IAM",
    NONE = "NONE",
}

export const enum HTTPMethod {
    ANY = "ANY",
    DELETE = "DELETE",
    GET = "GET",
    PATCH = "PATCH",
    POST = "POST",
    PUT = "PUT",
}

export const enum APIEndPointType {
    EDGE_OPTIMIZED = "EDGE",
    PRIVATE = "PRIVATE",
    REGIONAL = "REGIONAL",
}

export class RestAPIGateway extends S3BackendStack {
    apiGateway: aws.apiGatewayRestApi.ApiGatewayRestApi;
    private config: IRestAPIGatewayConfig;

    constructor(scope: Construct, id: string, config: IRestAPIGatewayConfig) {
        super(scope, id, Config.getS3BackendConfig(id));
        this.config = config;
        this.apiGateway = new aws.apiGatewayRestApi.ApiGatewayRestApi(
            this, config.name + '-RestAPIGateway', {
                name: Utils.getResourceName(config.name),
                description: config.description,
                endpointConfiguration: {
                    types: [config.type]
                },
                tags: config.tags,

            });
        for (const obj of config.proxyIntegrations) {
            this.createProxyIntegration(config.name, obj);
        }

        if (config.webAclArn) {
            new aws.wafv2WebAclAssociation.Wafv2WebAclAssociation(this, 'sdfghjk', {
                resourceArn: this.apiGateway.arn,
                webAclArn: config.webAclArn,
            });
        }

        new TerraformOutput(this, config.name + "", {
            value: this.apiGateway.id,
        })
    }

    private createProxyIntegration(name: string, obj: iProxyIntegration) {
        const proxy = new aws.apiGatewayResource.ApiGatewayResource(this, name + '-proxy-' + obj.name, {
            restApiId: this.apiGateway.id,
            parentId: this.apiGateway.rootResourceId,
            pathPart: obj.path,
        });

        const proxyMethod = new aws.apiGatewayMethod.ApiGatewayMethod(this, name + '-proxy-method' + obj.name, {
            restApiId: this.apiGateway.id,
            resourceId: proxy.id,
            authorization: obj.authorization,
            httpMethod: obj.method,
            apiKeyRequired: true,
        });

        const proxyIntegration = new aws.apiGatewayIntegration.ApiGatewayIntegration(this, name + '-proxy-integration' + obj.name, {
            httpMethod: proxyMethod.httpMethod,
            resourceId: proxy.id,
            restApiId: this.apiGateway.id,
            type: 'AWS_PROXY',
            integrationHttpMethod: obj.method,
            uri: `arn:aws:apigateway:${this.config.region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${this.config.region}:${this.config.accountId}:function: ${obj.lambdaName}/invocations`
        })

        if (obj.schema) {
            new aws.apiGatewayModel.ApiGatewayModel(this, name + '-model-' + obj.name, {
                restApiId: this.apiGateway.id,
                contentType: 'application/json',
                name: obj.method + obj.name,
                description: Utils.getResourceName(name + '-model-' + obj.name),
                schema: obj.schema,
            })
        }
        
        new aws.apiGatewayDeployment.ApiGatewayDeployment(this, name + '-deployment', {
            restApiId: this.apiGateway.id,
            dependsOn: [
                proxy,
                proxyMethod,
                proxyIntegration
            ],
            stageName: 'prod',
            variables: {
                deployed_at: "${timestamp()}"
            }
        })

        new aws.lambdaPermission.LambdaPermission(this, name + '-apigateway-lambda-permission', {
            action: 'lambda:InvokeFunction',
            functionName: obj.lambdaName,
            principal: 'apigateway.amazonaws.com',
            sourceArn: `${this.apiGateway.executionArn}/*/*`,
        })
    }
}