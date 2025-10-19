import { FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createSampleIr } from "@fern-api/test-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export async function createSampleGeneratorContext(pathToDefinition: string): Promise<ModelGeneratorContext> {
    const absolutePathToWorkspace = AbsoluteFilePath.of(pathToDefinition);
    const ir = await createSampleIr(absolutePathToWorkspace);
    const generatorConfig = createSampleGeneratorConfig();
    const customConfig: ModelCustomConfigSchema = {};
    const notificationService = new GeneratorNotificationService({
        type: "local",
        _visit: (visitor) => visitor.local()
    });
    return new ModelGeneratorContext(
        ir as IntermediateRepresentation,
        generatorConfig,
        customConfig,
        notificationService
    );
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
