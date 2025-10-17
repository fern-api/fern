import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { BaseRubyCustomConfigSchema } from "@fern-api/ruby-ast";

const DEFAULT_CONFIG: FernGeneratorExec.GeneratorConfig = {
    dryRun: false,
    irFilepath: "<placeholder>",
    output: {
        path: "<placeholder>",
        mode: {
            type: "github",
            version: "v1.0.0",
            repoUrl: "https://github.com/acme/acme-ruby"
        } as FernGeneratorExec.OutputMode
    },
    organization: "acme",
    workspaceName: "acme",
    environment: {
        _type: "local"
    } as FernGeneratorExec.GeneratorEnvironment,
    whitelabel: false,
    writeUnitTests: false,
    generateOauthClients: false,
    customConfig: {} as BaseRubyCustomConfigSchema
};

export function buildGeneratorConfig({
    customConfig
}: {
    customConfig?: Partial<BaseRubyCustomConfigSchema>;
} = {}): FernGeneratorExec.GeneratorConfig {
    return {
        ...DEFAULT_CONFIG,
        customConfig: {
            ...(DEFAULT_CONFIG.customConfig as BaseRubyCustomConfigSchema),
            ...customConfig
        }
    };
}
