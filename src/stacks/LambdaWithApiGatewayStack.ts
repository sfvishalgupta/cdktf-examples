// import {ILambdaWithApiGateway, S3BackendStack, LambdaWithApiGateway} from "arc-cdk";
// import {Construct} from "constructs";
// import * as Config from "../config";
// import * as aws from "@cdktf/provider-aws";
// import * as Utils from "../utils";
//
// export class LambdaWithApiGatewayStack extends S3BackendStack {
//     lambdaName: string;
//     constructor(scope: Construct, id: string, config: ILambdaWithApiGateway) {
//         super(scope, id, Config.getS3BackendConfig(id));
//         this.lambdaName = config.name;
//         new LambdaWithApiGateway(this, 'lambdaWithAPiGateway', config);
//
//         // new aws.lambdaAlias.LambdaAlias(this, Utils.getResourceName(this.lambdaName) + '-alias', {
//         //     // functionVersion: this.lambda.lambdaFunc.version,
//         //     functionVersion: '$LATEST',
//         //     name: 'my_alias',
//         //     functionName: this.lambda.arn,
//         // });
//         const restAPIGateway = new aws.apiGatewayRestApi.ApiGatewayRestApi(this, 'asdf', {
//             restApiName: "test-api-gateway",
//             description: 'asdf',
//             binaryMediaTypes: ['*/*'],
//             minimumCompressionSize: 1024,
//         })
//
//         // new aws.apiGatewayResource.ApiGatewayResource(this, 'asdf', {
//         //     restApiId: restAPIGateway.id,
//         //     parentId: restAPIGateway.rootResourceId,
//         //     pathPart: 'asdf',
//         //     resourceType: 'AWS::ApiGateway::Resource',
//         //     properties: {
//         //         parentId: restAPIGateway.rootResourceId,
//         //         pathPart: 'asdf',
//         //         resourceType: 'AWS::ApiGateway::Resource',
//         //     },
//         // })
//     }
// }