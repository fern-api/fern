import { AbstractGeneratorCli, parseIR } from "@fern-api/base-generator";
import { GeneratorNotificationService, FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { KotlinProject } from "./KotlinProject";
import { KotlinGeneratorContext } from "./KotlinGeneratorContext";
import { KotlinCustomConfig, KotlinCustomConfigSchema } from "./KotlinCustomConfig";

export abstract class AbstractKotlinGeneratorCli<
    CustomConfig extends KotlinCustomConfig,
    Context extends KotlinGeneratorContext
> extends AbstractGeneratorCli<CustomConfig, IntermediateRepresentation, Context> {
    protected parseCustomConfigOrThrow(customConfig: unknown): CustomConfig {
        const parsed = customConfig != null ? KotlinCustomConfigSchema.parse(customConfig) : {};
        return parsed as CustomConfig;
    }

    protected async parseIntermediateRepresentation(irFilepath: string): Promise<IntermediateRepresentation> {
        return await parseIR<IntermediateRepresentation>({
            absolutePathToIR: AbsoluteFilePath.of(irFilepath),
            parse: IrSerialization.IntermediateRepresentation.parse
        });
    }

    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: CustomConfig;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): Context {
        const project = new KotlinProject(AbsoluteFilePath.of(generatorConfig.output.path));

        return this.buildContext({
            ir,
            customConfig,
            generatorConfig,
            generatorNotificationService,
            project
        });
    }

    protected abstract buildContext(args: {
        ir: IntermediateRepresentation;
        customConfig: CustomConfig;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
        project: KotlinProject;
    }): Context;
}
