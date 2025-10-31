import { FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { BaseCsharpCustomConfigSchema, CsharpGeneratorContext } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { AsIsFiles } from "../AsIs";
import { CsharpProject } from "../project";
import { CORE_DIRECTORY_NAME, PUBLIC_CORE_DIRECTORY_NAME } from "../project/CsharpProject";

export abstract class BaseCsharpGeneratorContext<
    CustomConfig extends BaseCsharpCustomConfigSchema
> extends CsharpGeneratorContext<CustomConfig> {
    public readonly project: CsharpProject;

    public constructor(
        ir: IntermediateRepresentation,
        config: FernGeneratorExec.config.GeneratorConfig,
        customConfig: CustomConfig,
        generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.project = new CsharpProject({
            context: this,
            name: this.namespaces.root
        });
    }

    public getCoreDirectory(): RelativeFilePath {
        return RelativeFilePath.of(CORE_DIRECTORY_NAME);
    }

    public getPublicCoreDirectory(): RelativeFilePath {
        return join(this.getCoreDirectory(), RelativeFilePath.of(PUBLIC_CORE_DIRECTORY_NAME));
    }

    public getAsIsTestUtils(): string[] {
        return Object.values(AsIsFiles.Test.Utils);
    }

    public getRawAsIsFiles(): string[] {
        return [AsIsFiles.EditorConfig, AsIsFiles.GitIgnore];
    }
}
