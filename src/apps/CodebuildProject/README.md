## Codebuild Project

```javascript
export class CodebuildProjectApp {
    constructor(app: App, name: string) {
        const props: ICodebuildProjectConfig = GetCodeBuildConfig(name);
        new CodebuildStack(app, name, props);
    }
}
```