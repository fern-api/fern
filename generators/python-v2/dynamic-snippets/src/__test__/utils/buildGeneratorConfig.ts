import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { BasePythonCustomConfigSchema } from "@fern-api/python-browser-compatible-base";

const PYPI = {
    packageName: "acme",
    registryUrl: "https://registry.npmjs.org",
    username: "dummy",
    password: "dummy"
};

const DEFAULT_CONFIG: FernGeneratorExec.GeneratorConfig = {
    dryRun: false,
    irFilepath: "<placeholder>",
    output: {
        path: "<placeholder>",
        mode: FernGeneratorExec.OutputMode.publish({
            version: "1.0.0",
            publishTarget: FernGeneratorExec.GeneratorPublishTarget.pypi(PYPI),
            registries: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            registriesV2: {
                pypi: PYPI
            } as any // eslint-disable-line @typescript-eslint/no-explicit-any
        })
    },
    organization: "acme",
    workspaceName: "api",
    environment: FernGeneratorExec.GeneratorEnvironment.local(),
    whitelabel: false,
    writeUnitTests: false,
    generateOauthClients: false,
    customConfig: {
        client: {
            filename: "acme.py",
            class_name: "Acme"
        }
    } as BasePythonCustomConfigSchema
};

export function buildGeneratorConfig({
    customConfig
}: { customConfig?: Partial<BasePythonCustomConfigSchema> } = {}): FernGeneratorExec.GeneratorConfig {
    return {
        ...DEFAULT_CONFIG,
        customConfig: {
            ...(DEFAULT_CONFIG.customConfig as BasePythonCustomConfigSchema),
            ...customConfig
        }
    };
}
