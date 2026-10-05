import { FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMigratedSampleIr, getIrVersionFromPackageJson } from "@fern-api/test-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export async function createSampleGeneratorContext(pathToDefinition: string): Promise<SdkGeneratorContext> {
    const absolutePathToWorkspace = AbsoluteFilePath.of(pathToDefinition);
    const irVersion = await getIrVersionFromPackageJson(__dirname);
    const ir = await createMigratedSampleIr<FernIr.IntermediateRepresentation>(absolutePathToWorkspace, irVersion);
    const customConfig: SdkCustomConfigSchema = SdkCustomConfigSchema.parse({});
    const notificationService = new GeneratorNotificationService({
        type: "local",
        _visit: (visitor) => visitor.local()
    });
    return new SdkGeneratorContext(ir, createSampleGeneratorConfig(), customConfig, notificationService);
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
