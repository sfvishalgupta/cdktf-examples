import {APIGateway_Authorizer, APIGateway_EndPointType, APIGateway_HTTPMethod, APIGateway_LoggingLevel,} from "./types";
import {ApiGatewayRestApiConfig} from "@cdktf/provider-aws/lib/api-gateway-rest-api";

export interface IRestAPIGatewayConfig extends ApiGatewayRestApiConfig {
    /**
     * Type of API Gateway.
     */
    type: APIGateway_EndPointType;

    /**
     * Region of API Gateway.
     */
    region: string;

    /**
     * Stage Name of the API Gateway.
     */
    stageName: string;

    /**
     * Enable Data Tracking. Defaults to false.
     */
    dataTraceEnabled?: boolean;

    /**
     * API Gateway Logging Level. Default is OFF.
     */
    loggingLevel?: APIGateway_LoggingLevel;

    /**
     * Throttling Burst Limit. Default is -1.
     */
    throttlingBurstLimit?: number;

    /**
     * Throttling Rate limit. Default is -1.
     */
    throttlingRateLimit?: number;

    /**
     * Web ACL ARN to attach with API Gateway..
     */
    webAclArn?: string;

    /**
     * Array of Proxy Integrations.
     */
    proxyIntegrations: iProxyIntegration [];

    /**
     * API Key Required?
     */
    apiKeyRequired?: boolean;

    /**
     * Name of the API Key.
     */
    apiKeyName?: string;

    /**
     * Name of the Usage Plan.
     */
    apiKeyUsagePlanName?: string;

    /**
     * API Key Burst Limit. Default value is 5000.
     */
    apiKeyBurstLimit? : number;

    /**
     * API Key Rate Limit Per Sec. Default value is 10000 Per Second
     */
    apiKeyRateLimit? : number;

    name: string;
}

export interface iProxyIntegration {
    methods: IRestAPIGatewayMethods[],
    name: string,
    path: string,
}

export interface IRestAPIGatewayMethods {
    apiKeyRequired?: boolean;
    authorization?: APIGateway_Authorizer
    lambdaName: string
    method?: APIGateway_HTTPMethod
    name: string,
    schema?: string,
    alias?: string,
}