import { FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMigratedSampleIr } from "@fern-api/test-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { ModelCustomConfigSchema } from "../ModelCustomConfig.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export async function createSampleGeneratorContext(pathToDefinition: string): Promise<ModelGeneratorContext> {
    const absolutePathToWorkspace = AbsoluteFilePath.of(pathToDefinition);
    const ir = await createMigratedSampleIr<FernIr.IntermediateRepresentation>(absolutePathToWorkspace, "v65");
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
