import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractKotlinGeneratorCli, KotlinProject } from "@fern-api/kotlin-base";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-api/ir-sdk/api";
import { SdkCustomConfig, SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { ModelGenerator } from "./generators/ModelGenerator";
import { ClientGenerator } from "./generators/ClientGenerator";
import { ErrorGenerator } from "./generators/ErrorGenerator";
import { GradleGenerator } from "./generators/GradleGenerator";

export class SdkGeneratorCli extends AbstractKotlinGeneratorCli<SdkCustomConfig, SdkGeneratorContext> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService,
        project
    }: {
        ir: IntermediateRepresentation;
        customConfig: SdkCustomConfig;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
        project: KotlinProject;
    }): SdkGeneratorContext {
        return new SdkGeneratorContext(ir, generatorConfig, customConfig, project, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): SdkCustomConfig {
        const parsed = customConfig != null ? SdkCustomConfigSchema.parse(customConfig) : {};
        return parsed as SdkCustomConfig;
    }

    protected async publishPackage(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    private async generate(context: SdkGeneratorContext): Promise<void> {
        context.logger.info("Generating Kotlin SDK...");

        const modelGenerator = new ModelGenerator(context);
        await modelGenerator.generate();

        const errorGenerator = new ErrorGenerator(context);
        await errorGenerator.generate();

        const clientGenerator = new ClientGenerator(context);
        await clientGenerator.generate();

        const gradleGenerator = new GradleGenerator(context);
        await gradleGenerator.generate();

        await context.project.persist();

        context.logger.info("Kotlin SDK generation complete!");
    }
}
