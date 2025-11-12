import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { CsharpConfigSchema } from "@fern-api/csharp-codegen";

const DEFAULT_CONFIG: FernGeneratorExec.GeneratorConfig = {
    dryRun: false,
    irFilepath: "<placeholder>",
    output: {
        path: "<placeholder>",
        mode: FernGeneratorExec.OutputMode.github({
            version: "v1.0.0",
            repoUrl: "https://github.com/acme/acme-dotnet"
        })
    },
    organization: "acme",
    workspaceName: "acme",
    environment: FernGeneratorExec.GeneratorEnvironment.local(),
    whitelabel: false,
    writeUnitTests: false,
    generateOauthClients: false,
    customConfig: {
        namespace: "Acme",
        "client-class-name": "AcmeClient",
        "base-exception-class-name": "AcmeException",
        "base-api-exception-class-name": "AcmeApiException",
        "environment-class-name": "AcmeEnvironment",
        "explicit-namespaces": true,
        "inline-path-parameters": true
    } as CsharpConfigSchema
};

export function buildGeneratorConfig({
    customConfig
}: {
    customConfig?: Partial<CsharpConfigSchema>;
} = {}): FernGeneratorExec.GeneratorConfig {
    return {
        ...DEFAULT_CONFIG,
        customConfig: {
            ...(DEFAULT_CONFIG.customConfig as CsharpConfigSchema),
            ...customConfig
        }
    };
}
