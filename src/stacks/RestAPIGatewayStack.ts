import {S3BackendStack} from "arc-cdk";
import {Construct} from "constructs";
import {TerraformOutput} from "cdktf";
import {IRestAPIGatewayConfig, RestApiGateway} from "../lib"

import * as Config from "../config";


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
        const config: IRestAPIGatewayConfig = Config.GetApiGatewayConfig(id, lambdaARN, wafARN);
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