import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";

interface RustCustomConfigSchema {
    packageName?: string;
    crateName?: string;
    clientName?: string;
}

const DEFAULT_CONFIG: FernGeneratorExec.GeneratorConfig = {
    dryRun: false,
    irFilepath: "<placeholder>",
    output: {
        path: "<placeholder>",
        mode: FernGeneratorExec.OutputMode.github({
            version: "v1.0.0",
            repoUrl: "https://github.com/acme/acme-rust"
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
        crateName: "acme_api",
        clientName: "Client"
    } as RustCustomConfigSchema
};

export function buildGeneratorConfig({
    customConfig
}: {
    customConfig?: Partial<RustCustomConfigSchema>;
} = {}): FernGeneratorExec.GeneratorConfig {
    return {
        ...DEFAULT_CONFIG,
        customConfig: {
            ...(DEFAULT_CONFIG.customConfig as RustCustomConfigSchema),
            ...customConfig
        }
    };
}
