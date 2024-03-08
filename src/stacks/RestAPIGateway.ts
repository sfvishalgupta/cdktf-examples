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
}

interface IRestAPIGatewayConfig {
    region:string;
    accountId: string;
    name: string;
    type: string;
    description: string;
    tags: { [key: string]: string };
    proxyIntegrations: [iProxyIntegration]
}

export const enum HTTPMethod {
    GET = "GET",
    ANY = "ANY"
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
            httpMethod: obj.method
        });

        const proxyIntegration = new aws.apiGatewayIntegration.ApiGatewayIntegration(this, name + '-proxy-integration' + obj.name, {
            httpMethod: proxyMethod.httpMethod,
            resourceId: proxy.id,
            restApiId: this.apiGateway.id,
            type: 'AWS_PROXY',
            integrationHttpMethod: obj.method,
            uri: `arn:aws:apigateway:${this.config.region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${this.config.region}:${this.config.accountId}:function: ${obj.lambdaName}/invocations`
        })

        const deployment = new aws.apiGatewayDeployment.ApiGatewayDeployment(this, name+ '-deployment', {
            restApiId: this.apiGateway.id,
            dependsOn: [
                proxyIntegration
            ],
            stageName: 'prod',
        })

        new aws.lambdaPermission.LambdaPermission(this, name+'-apigateway-lambda-permission', {
            action: 'lambda:InvokeFunction',
            functionName: obj.lambdaName,
            principal: 'apigateway.amazonaws.com',
            sourceArn: `${this.apiGateway.executionArn}/*/*`,
        })
    }
}