import { GeneratorConfig, GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractPhpGeneratorCli } from "@fern-api/php-base";
import { FernIr } from "@fern-fern/ir-sdk";

import { generateModels } from "./generateModels.js";
import { generateTraits } from "./generateTraits.js";
import { ModelCustomConfigSchema } from "./ModelCustomConfig.js";
import { ModelGeneratorContext } from "./ModelGeneratorContext.js";

export class ModelGeneratorCLI extends AbstractPhpGeneratorCli<ModelCustomConfigSchema, ModelGeneratorContext> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: FernIr.IntermediateRepresentation;
        customConfig: ModelCustomConfigSchema;
        generatorConfig: GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): ModelGeneratorContext {
        return new ModelGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): ModelCustomConfigSchema {
        return {};
    }

    protected async publishPackage(context: ModelGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: ModelGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async writeForDownload(context: ModelGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async generate(context: ModelGeneratorContext): Promise<void> {
        generateModels(context);
        generateTraits(context);
        await context.project.persist();
    }
}
