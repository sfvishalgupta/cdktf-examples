import {S3BackendStack} from "arc-cdk";
import * as Config from "../config";
import {Construct} from "constructs";
import * as aws from "@cdktf/provider-aws"
import {TerraformOutput} from "cdktf";
import * as Utils from "../utils";
import {iProxyIntegration, IRestAPIGatewayConfig} from "../interfaces";
import {ITerraformDependable} from "cdktf/lib/terraform-dependable";


export class RestAPIGateway extends S3BackendStack {
    apiGateway: aws.apiGatewayRestApi.ApiGatewayRestApi;
    private config: IRestAPIGatewayConfig;
    private dependsOnResource: ITerraformDependable[] = [];

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
        const deployment = new aws.apiGatewayDeployment.ApiGatewayDeployment(this, config.name + '-deployment', {
            restApiId: this.apiGateway.id,
            dependsOn: this.dependsOnResource,
            stageName: config.stageName,
            variables: {
                deployed_at: "${timestamp()}"
            }
        });

        // new aws.apiGatewayMethodSettings.ApiGatewayMethodSettings(this, config.name + '-method-setting', {
        //     restApiId: this.apiGateway.id,
        //     methodPath: "*/*",
        //     stageName: config.stageName,
        //     settings: {
        //         dataTraceEnabled: true,
        //         loggingLevel: "INFO",
        //         throttlingBurstLimit: 100,
        //         throttlingRateLimit: 100
        //     }
        // });

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

        for (const method of obj.methods) {
            const proxyMethod = new aws.apiGatewayMethod.ApiGatewayMethod(this, name + '-proxy-method' + obj.name + "-" + method.name, {
                restApiId: this.apiGateway.id,
                resourceId: proxy.id,
                authorization: method.authorization,
                httpMethod: method.method,
                apiKeyRequired: method.apiKeyRequired
            });
            this.dependsOnResource.push(proxyMethod);

            const proxyMethodResponse = new aws.apiGatewayMethodResponse.ApiGatewayMethodResponse(this, name + '-proxy-method-response' + obj.name + "-" + method.name, {
                restApiId: this.apiGateway.id,
                resourceId: proxy.id,
                statusCode: "200",
                httpMethod: method.method,
                responseParameters: {
                    "method.response.header.Access-Control-Allow-Origin": true
                },
                dependsOn: [proxyMethod]
            });
            this.dependsOnResource.push(proxyMethodResponse);

            const apiInt = new aws.apiGatewayIntegration.ApiGatewayIntegration(this, name + '-proxy-integration' + obj.name + "-" + method.name, {
                httpMethod: proxyMethod.httpMethod,
                resourceId: proxyMethod.resourceId,
                restApiId: this.apiGateway.id,
                type: 'AWS_PROXY',
                integrationHttpMethod: "POST",
                uri: `arn:aws:apigateway:${this.config.region}:lambda:path/2015-03-31/functions/${method.lambdaName}/invocations`
            })
            this.dependsOnResource.push(apiInt);


            if (method.schema) {
                const model = new aws.apiGatewayModel.ApiGatewayModel(this, name + '-model-' + obj.name + "-" + method.name, {
                    restApiId: this.apiGateway.id,
                    contentType: 'application/json',
                    name: method.name,
                    description: Utils.getResourceName(name + '-model-' + obj.name),
                    schema: method.schema
                });
                this.dependsOnResource.push(model)
            }

            new aws.lambdaPermission.LambdaPermission(this, name + '-apigateway-lambda-permission' + obj.name + "-" + method.name, {
                action: 'lambda:InvokeFunction',
                functionName: method.lambdaName,
                principal: 'apigateway.amazonaws.com',
                sourceArn: `${this.apiGateway.executionArn}/*/${method.method}/${obj.path}`,
            })
        }
    }
}