import { FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { ModelCustomConfigSchema } from "../../ModelCustomConfig";
import { ModelGeneratorContext } from "../../ModelGeneratorContext";
import { createSampleIrForTestDefinition } from "./createSampleIrForTestDefinition";

export async function createSampleGeneratorContext(testDefinitionName: string): Promise<ModelGeneratorContext> {
    const ir = await createSampleIrForTestDefinition(testDefinitionName);
    const generatorConfig = createSampleGeneratorConfig();
    const customConfig: ModelCustomConfigSchema = {};
    const notificationService = new GeneratorNotificationService({
        type: "local",
        _visit: (visitor) => visitor.local()
    });
    return new ModelGeneratorContext(ir, generatorConfig, customConfig, notificationService);
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
