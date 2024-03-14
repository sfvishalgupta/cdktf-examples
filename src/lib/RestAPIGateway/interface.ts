import {APIGateway_Authorizer, APIGateway_EndPointType, APIGateway_HTTPMethod, APIGateway_LoggingLevel,} from "./types";
import {ApiGatewayRestApiConfig} from "@cdktf/provider-aws/lib/api-gateway-rest-api";

export interface IRestAPIGatewayConfig extends ApiGatewayRestApiConfig {
    dataTraceEnabled?: boolean;
    loggingLevel?: APIGateway_LoggingLevel;
    proxyIntegrations: iProxyIntegration [];
    region: string;
    stageName: string;
    throttlingBurstLimit?: number;
    throttlingRateLimit?: number;
    type: APIGateway_EndPointType;
    webAclArn?: string;
}

export interface iProxyIntegration {
    methods: IRestAPIGatewayMethods[],
    name: string,
    path: string,
}

export interface IRestAPIGatewayMethods {
    apiKeyRequired?: boolean;
    authorization: APIGateway_Authorizer
    lambdaName: string
    method: APIGateway_HTTPMethod
    name: string,
    schema?: string,
    alias?: string,
}