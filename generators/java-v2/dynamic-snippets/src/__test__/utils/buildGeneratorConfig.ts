import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator"
import { BaseJavaCustomConfigSchema } from "@fern-api/java-ast"

const DEFAULT_CONFIG: FernGeneratorExec.GeneratorConfig = {
    dryRun: false,
    irFilepath: "<placeholder>",
    output: {
        path: "<placeholder>",
        mode: FernGeneratorExec.OutputMode.github({
            version: "v1.0.0",
            repoUrl: "https://github.com/acme/acme-java"
        })
    },
    organization: "acme",
    workspaceName: "acme",
    environment: FernGeneratorExec.GeneratorEnvironment.local(),
    whitelabel: false,
    writeUnitTests: false,
    generateOauthClients: false,
    customConfig: {
        "inline-file-properties": true,
        "package-layout": "flat"
    } as BaseJavaCustomConfigSchema
}

export function buildGeneratorConfig({
    customConfig
}: {
    customConfig?: Partial<BaseJavaCustomConfigSchema>
} = {}): FernGeneratorExec.GeneratorConfig {
    return {
        ...DEFAULT_CONFIG,
        customConfig: {
            ...(DEFAULT_CONFIG.customConfig as BaseJavaCustomConfigSchema),
            ...customConfig
        }
    }
}
