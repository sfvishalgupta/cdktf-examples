import * as aws from "@cdktf/provider-aws";

export interface IRestAPIGatewayMethods {
    name: string;
    authorization: string
    method: string
    lambdaName: string
    apiKeyRequired?: boolean,
    schema?: string
}

export interface iProxyIntegration {
    name: string
    path: string
    methods: IRestAPIGatewayMethods[]
}

export interface IRestAPIGatewayConfig extends aws.apiGatewayRestApi.ApiGatewayRestApiConfig {
    region: string;
    type: string;
    proxyIntegrations: iProxyIntegration [];
    webAclArn?: string;
    stageName: string;
}

