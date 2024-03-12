import * as aws from "@cdktf/provider-aws";
import {APIEndPointType, APILoggingLevel, Authorizer, HTTPMethod} from "./constants";
import {ILambda} from 'arc-cdk';
import {Wafv2WebAclConfig} from "@cdktf/provider-aws/lib/wafv2-web-acl";
import {Wafv2IpSetConfig} from "@cdktf/provider-aws/lib/wafv2-ip-set";
import {Wafv2WebAclRule} from "@cdktf/provider-aws/lib/wafv2-web-acl/index-structs";

/* The `export interface IRestAPIGatewayMethods` is defining a TypeScript interface that specifies the
configuration options for individual methods in a REST API Gateway. It includes properties such as
`apiKeyRequired`, `authorization`, `lambdaName`, `method`, `name`, and `schema`. This interface is
used to define the settings for integrating different HTTP methods with Lambda functions in a REST
API Gateway setup within an AWS CDK for Terraform project. */
export interface IRestAPIGatewayMethods {
    apiKeyRequired?: boolean;
    authorization: Authorizer
    lambdaName: string
    method: HTTPMethod
    name: string,
    schema?: string,
    alias?: string,
}

/* The `export interface iProxyIntegration` is defining a TypeScript interface that specifies the
configuration options for a proxy integration in a REST API Gateway. It includes properties such as
`methods`, `name`, and `path`. This interface is used to define the settings for integrating
different HTTP methods with Lambda functions in a proxy integration setup for a REST API Gateway in
an AWS CDK for Terraform project. */
export interface iProxyIntegration {
    methods: IRestAPIGatewayMethods[],
    name: string,
    path: string,
}

/* The `export interface IRestAPIGatewayConfig` is defining a TypeScript interface that specifies the
configuration options for a REST API Gateway. This interface extends the
`aws.apiGatewayRestApi.ApiGatewayRestApiConfig` interface provided by the CDK for Terraform AWS
provider. It includes properties such as `dataTraceEnabled`, `loggingLevel`, `proxyIntegrations`,
`region`, `stageName`, `throttlingBurstLimit`, `throttlingRateLimit`, `type`, and `webAclArn`. This
interface is used to define the configuration settings for creating a REST API Gateway in an AWS CDK
for Terraform project. */
export interface IRestAPIGatewayConfig extends aws.apiGatewayRestApi.ApiGatewayRestApiConfig {
    dataTraceEnabled?: boolean;
    loggingLevel?: APILoggingLevel;
    proxyIntegrations: iProxyIntegration [];
    region: string;
    stageName: string;
    throttlingBurstLimit?: number;
    throttlingRateLimit?: number;
    type: APIEndPointType;
    webAclArn?: string;
}

export interface IAdvancedLambda extends ILambda {
    enableAlias?: boolean;
    aliasName?: string;
    aliasVersion?: string;
}
