import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";

const NPM_CONFIG = {
    packageName: "acme",
    registryUrl: "https://registry.npmjs.org",
    token: "dummy"
};

const DEFAULT_CONFIG: FernGeneratorExec.GeneratorConfig = {
    dryRun: false,
    irFilepath: "<placeholder>",
    output: {
        path: "<placeholder>",
        mode: FernGeneratorExec.OutputMode.publish({
            version: "1.0.0",
            publishTarget: FernGeneratorExec.GeneratorPublishTarget.npm(NPM_CONFIG),
            registries: {
                npm: NPM_CONFIG
                // biome-ignore lint/suspicious/noExplicitAny: allow
            } as any,
            registriesV2: {
                npm: NPM_CONFIG
                // biome-ignore lint/suspicious/noExplicitAny: allow
            } as any
        })
    },
    organization: "acme",
    workspaceName: "acme",
    environment: FernGeneratorExec.GeneratorEnvironment.local(),
    whitelabel: false,
    writeUnitTests: false,
    generateOauthClients: false,
    customConfig: {
        namespaceExport: "Acme",
        inlineFileProperties: true,
        inlinePathParameters: true,
        useBigInt: true
    } as TypescriptCustomConfigSchema
};

export function buildGeneratorConfig({
    customConfig
}: { customConfig?: Partial<TypescriptCustomConfigSchema> } = {}): FernGeneratorExec.GeneratorConfig {
    return {
        ...DEFAULT_CONFIG,
        customConfig: {
            ...(DEFAULT_CONFIG.customConfig as TypescriptCustomConfigSchema),
            ...customConfig
        }
    };
}
