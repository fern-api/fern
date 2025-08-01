import { resolve } from "node:path";

import { FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createSampleIr } from "@fern-api/test-utils";

import { ModelCustomConfigSchema } from "../../ModelCustomConfig";
import { ModelGeneratorContext } from "../../ModelGeneratorContext";

export async function createSampleGeneratorContext(testDefinitionName: string): Promise<ModelGeneratorContext> {
    const absolutePathToWorkspace = AbsoluteFilePath.of(resolve(__dirname, "../test-definitions", testDefinitionName));
    const ir = await createSampleIr(absolutePathToWorkspace);
    const generatorConfig = createSampleGeneratorConfig();
    const customConfig: ModelCustomConfigSchema = ModelCustomConfigSchema.parse({
        generateBuilders: false,
        deriveDebug: true,
        deriveClone: true
    });
    const notificationService = new GeneratorNotificationService({
        type: "local",
        _visit: (visitor) => visitor.local()
    });
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return new ModelGeneratorContext(ir as any, generatorConfig, customConfig, notificationService);
}

function createSampleGeneratorConfig(): FernGeneratorExec.config.GeneratorConfig {
    return {
        dryRun: false,
        irFilepath: "ir.json",
        output: {
            path: AbsoluteFilePath.of(__dirname) + "/output",
            mode: {
                type: "downloadFiles",
                _visit: (visitor) => visitor.downloadFiles()
            }
        },
        workspaceName: "test",
        organization: "test",
        environment: {
            type: "local",
            _visit: (visitor) => visitor.local()
        },
        whitelabel: false,
        writeUnitTests: false,
        generateOauthClients: false
    };
}
