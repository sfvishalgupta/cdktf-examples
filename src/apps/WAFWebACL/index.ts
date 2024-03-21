import {App} from "cdktf";
import {WafWebACLStack} from "../../stacks";

export class WAFWebACLApp {
    constructor(app: App, name: string) {
        new WafWebACLStack(app, name);
    }
}