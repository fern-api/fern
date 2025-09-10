import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { BaseGoCustomConfigSchema } from "@fern-api/go-ast";

const DEFAULT_CONFIG: FernGeneratorExec.GeneratorConfig = {
    dryRun: false,
    irFilepath: "<placeholder>",
    output: {
        path: "<placeholder>",
        mode: FernGeneratorExec.OutputMode.github({
            version: "v1.0.0",
            repoUrl: "https://github.com/acme/acme-go"
        })
    },
    organization: "acme",
    workspaceName: "acme",
    environment: FernGeneratorExec.GeneratorEnvironment.local(),
    whitelabel: false,
    writeUnitTests: false,
    generateOauthClients: false,
    customConfig: {
        packageName: "acme",
        union: "v1",
        inlineFileProperties: true
    } as BaseGoCustomConfigSchema
};

export function buildGeneratorConfig({
    customConfig
}: {
    customConfig?: Partial<BaseGoCustomConfigSchema>;
} = {}): FernGeneratorExec.GeneratorConfig {
    return {
        ...DEFAULT_CONFIG,
        customConfig: {
            ...(DEFAULT_CONFIG.customConfig as BaseGoCustomConfigSchema),
            ...customConfig
        }
    };
}
