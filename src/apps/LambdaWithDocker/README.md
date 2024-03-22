## Lambda with Docker Containers

```javascript
export class LambdaWithDockerApp {
    lambdaWithECR: LambdaWithECR;

    constructor(app: App, name: string, enableAPI: boolean) {
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

        if (enableAPI) {
            new RestAPIGatewayStack(app, name + "-api-gateway", GetApiGatewayConfig(name, this.lambdaWithECR.lambda?.arn!)
        )
        }
    }
}
```