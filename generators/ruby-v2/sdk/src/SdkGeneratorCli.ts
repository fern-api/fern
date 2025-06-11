import urlJoin from "url-join";

import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractRubyGeneratorCli, RubyFile } from "@fern-api/ruby-base";

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
        return {};
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
        const files: RubyFile[] = [];
        for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
            const file = typeDeclaration.shape._visit<RubyFile | undefined>({
                alias: () => undefined,
                object: (otd) => {
                    return undefined;
                    // TODO: return new ObjectGenerator(args).generate();
                },
                enum: () => undefined,
                undiscriminatedUnion: () => undefined,
                union: () => undefined,
                _other: () => undefined
            });
            if (file != null) {
                files.push(file);
            }
        }

        await context.project.persist();
    }
}
