import {App} from "cdktf";
import {LambdaWithECR, RestAPIGatewayStack} from "../../stacks";
import {resolve} from "path";
import * as Config from "../../config";
import {
    APIGatewayAuthorizer,
    APIGatewayEndPointType,
    APIGatewayHTTPMethod,
    APIGatewayLoggingLevel,
    IRestAPIGatewayConfig
} from "arc-cdk";
import * as listCats from "../../schema/listCats.json";

function GetApiGatewayConfig(id: string, lambdaFn: string, webAclArn?: string): IRestAPIGatewayConfig {
    return {
        name: id,
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

export class LambdaWithDockerApp {
    lambdaWithECR: LambdaWithECR;

    constructor(app: App, name: string) {
        this.lambdaWithECR = new LambdaWithECR(app, name, {
            name,
            codePath: resolve(__dirname, './image/'),
            memorySize: 256,
            timeout: 30,
            namespace: process.env.NAMESPACE || '',
            environment: process.env.ENVIRONMENT || '',
            envVars: {
                "username": `ssm:/erin/poc/aurora/cluster_admin_db_username~true`,
                "test": "test"
            },
            useImage: true,
            tags: Config.tags
        });

        new RestAPIGatewayStack(
            app,
            name + "-api-gateway",
            GetApiGatewayConfig(name, this.lambdaWithECR.lambda?.arn!)
        )
    }
}