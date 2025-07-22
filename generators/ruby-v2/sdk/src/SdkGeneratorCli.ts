import urlJoin from "url-join";

import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractRubyGeneratorCli } from "@fern-api/ruby-base";

import { generateModels } from "@fern-api/ruby-model";
import { ModelGeneratorContext } from "@fern-api/ruby-model";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";

export class SdkGeneratorCLI extends AbstractRubyGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: SdkCustomConfigSchema;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): SdkGeneratorContext {
        return new SdkGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): SdkCustomConfigSchema {
        const parsed = customConfig != null ? SdkCustomConfigSchema.parse(customConfig) : undefined;
        if (parsed != null) {
            return parsed;
        }
        return {
            superclass: {
                name: "Model",
                modules: ["Internal", "Types"]
            }
        };
    }

    protected async publishPackage(context: SdkGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        // Create a ModelGeneratorContext to generate models and as-is files
        const modelContext = new ModelGeneratorContext(
            context.ir,
            context.config,
            {
                // Pass the client module name from SDK config to model config
                clientModuleName: context.customConfig.clientModuleName,
                typesModuleName: "Types",
                // Pass the superclass configuration from SDK config to model config
                superclass: context.customConfig.superclass
            },
            context.generatorNotificationService
        );

        const models = generateModels({ context: modelContext });
        for (const file of models) {
            context.project.addRawFiles(file);
        }

        await context.project.persist();
    }
}