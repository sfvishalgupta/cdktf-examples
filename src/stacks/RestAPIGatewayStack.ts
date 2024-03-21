import {
    APIGatewayAuthorizer,
    APIGatewayEndPointType,
    APIGatewayHTTPMethod,
    APIGatewayLoggingLevel,
    IRestAPIGatewayConfig,
    RestApiGateway,
    S3BackendStack
} from "arc-cdk";
import {Construct} from "constructs";
import {TerraformOutput,} from "cdktf";
import * as Config from "../config";
import * as listCats from "../schema/listCats.json";
import {tags} from "../config";

/**
 * Returns an API Gateway configuration for a REST API with a single endpoint that invokes the specified Lambda function.
 * @param id
 * @param lambdaFn - the name of the Lambda function to invoke
 * @param webAclArn
 */
function GetApiGatewayConfig(id: string, lambdaFn: string, webAclArn?: string): IRestAPIGatewayConfig {
    return {
        name: "print-lambda",
        environment: process.env.ENVIRONMENT!,
        namespace: process.env.NAMESPACE!,
        region: process.env.region!,
        type: APIGatewayEndPointType.REGIONAL,
        tags: {...Config.tags, StackName: id},
        description: "Created by cdktf",
        stageName: "prod",
        webAclArn,
        dataTraceEnabled: false,
        loggingLevel: APIGatewayLoggingLevel.OFF,
        throttlingBurstLimit: -1,
        throttlingRateLimit: -1,
        apiKeyRequired: true,
        proxyIntegrations: [{
            name: "Cats",
            path: "cats",
            methods: [{
                name: "listCats",
                authorization: APIGatewayAuthorizer.NONE,
                method: APIGatewayHTTPMethod.GET,
                lambdaName: lambdaFn!,
                apiKeyRequired: false,
                schema: JSON.stringify(listCats),
                alias: "$latest"
            }, {
                name: "createCat",
                authorization: APIGatewayAuthorizer.NONE,
                method: APIGatewayHTTPMethod.POST,
                lambdaName: lambdaFn,
                apiKeyRequired: false,
                schema: JSON.stringify(listCats)
            }],
        }, {
            name: "Dogs",
            path: "dogs",
            methods: [{
                name: "listDogs",
                authorization: APIGatewayAuthorizer.NONE,
                method: APIGatewayHTTPMethod.GET,
                lambdaName: lambdaFn!,
                apiKeyRequired: false,
                schema: JSON.stringify(listCats),
                alias: "$latest"
            }],
        }]
    }
}

/**
 * Creates an API Gateway REST API and its associated resources.
 * @param scope the parent construct
 * @param id the construct ID
 * @param config the API configuration
 */
export class RestAPIGatewayStack extends S3BackendStack {
    private apiGateway: RestApiGateway;

    constructor(scope: Construct, id: string, lambdaARN: string, wafARN?: string) {
        super(scope, id, Config.getS3BackendConfig(id));
        const config: IRestAPIGatewayConfig = GetApiGatewayConfig(id, lambdaARN, wafARN);
        this.apiGateway = new RestApiGateway(
            this, id + '-RestAPIGateway', config);

        new TerraformOutput(this, id + "-" + config.name + "-api-gateway-id", {
            value: this.apiGateway.apiGateway.id
        });

        new TerraformOutput(this, id + "-" + config.name + "-api-gateway-arn", {
            value: this.apiGateway.apiGateway.arn,
        });

        new TerraformOutput(this, id + "-" + config.name + "-api-gateway-deployment-id", {
            value: this.apiGateway.deployment.id,
        })
    }
}