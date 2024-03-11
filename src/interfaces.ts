import * as aws from "@cdktf/provider-aws";
import {APIEndPointType, APILoggingLevel, Authorizer, HTTPMethod} from "./constants";

export interface IRestAPIGatewayMethods {
    name: string;
    authorization: Authorizer
    method: HTTPMethod
    lambdaName: string
    apiKeyRequired?: boolean,
    schema?: string,
}

export interface iProxyIntegration {
    name: string
    path: string
    methods: IRestAPIGatewayMethods[]
}

export interface IRestAPIGatewayConfig extends aws.apiGatewayRestApi.ApiGatewayRestApiConfig {
    region: string;
    type: APIEndPointType;
    proxyIntegrations: iProxyIntegration [];
    webAclArn?: string;
    stageName: string;
    loggingLevel?: APILoggingLevel;
    dataTraceEnabled?: boolean;
    throttlingBurstLimit?: number;
    throttlingRateLimit?: number;
}

