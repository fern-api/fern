import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { z } from "zod";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { RustProject } from "../project";

export const BaseRustCustomConfigSchema = z.object({
    packageName: z.string().optional(),
    packageVersion: z.string().optional(),
    extraDependencies: z.record(z.string()).optional(),
    extraDevDependencies: z.record(z.string()).optional()
});

export type BaseRustCustomConfigSchema = z.infer<typeof BaseRustCustomConfigSchema>;

export abstract class AbstractRustGeneratorContext<
    CustomConfig extends BaseRustCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly project: RustProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.project = new RustProject({
            context: this,
            packageName: customConfig.packageName ?? this.getDefaultPackageName(),
            packageVersion: customConfig.packageVersion ?? "0.1.0"
        });
    }

    private getDefaultPackageName(): string {
        return `${this.config.organization}_${this.ir.apiName.snakeCase.unsafeName}`.toLowerCase();
    }
} 