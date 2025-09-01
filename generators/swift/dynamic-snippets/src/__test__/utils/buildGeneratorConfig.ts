import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { BaseSwiftCustomConfigSchema } from "@fern-api/swift-codegen";

const DEFAULT_CONFIG: FernGeneratorExec.GeneratorConfig = {
    dryRun: false,
    irFilepath: "<placeholder>",
    output: {
        path: "<placeholder>",
        mode: FernGeneratorExec.OutputMode.github({
            version: "v1.0.0",
            repoUrl: "https://github.com/acme/acme-swift"
        })
    },
    organization: "acme",
    workspaceName: "acme",
    environment: FernGeneratorExec.GeneratorEnvironment.local(),
    whitelabel: false,
    writeUnitTests: false,
    generateOauthClients: false,
    customConfig: {
        clientClassName: "AcmeClient",
        environmentEnumName: "AcmeEnvironment"
    } as BaseSwiftCustomConfigSchema
};

export function buildGeneratorConfig({
    customConfig
}: {
    customConfig?: Partial<BaseSwiftCustomConfigSchema>;
} = {}): FernGeneratorExec.GeneratorConfig {
    return {
        ...DEFAULT_CONFIG,
        customConfig: {
            ...(DEFAULT_CONFIG.customConfig as BaseSwiftCustomConfigSchema),
            ...customConfig
        }
    };
}
