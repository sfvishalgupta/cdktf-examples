import {App} from "cdktf";
import {LambdaWithECR} from "../stacks";
import {resolve} from "path";
import * as Config from "../config";

export class LambdaWithDockerApp {
    lambdaWithECR: LambdaWithECR;

    constructor(app: App, name: string) {
        this.lambdaWithECR = new LambdaWithECR(app, name, {
            name,
            codePath: resolve(__dirname, '../../image/'),
            memorySize: 256,
            timeout: 30,
            namespace: process.env.NAMESPACE || '',
            environment: process.env.ENVIRONMENT || '',
            envVars: {
                "username": "ssm:/erin/poc/aurora/cluster_admin_db_username~true",
                "test": "test"
            },
            useImage: true,
            tags: Config.tags
        });
    }
}