import { GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractSwiftGeneratorCli, SwiftFile } from "@fern-api/swift-base";
import { generateModels } from "@fern-api/swift-model";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { RootClientGenerator, SubClientGenerator } from "./generators";

export class SdkGeneratorCLI extends AbstractSwiftGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
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
            return this.validateCustomConfig(parsed);
        }
        return {};
    }

    private validateCustomConfig(customConfig: SdkCustomConfigSchema): SdkCustomConfigSchema {
        return customConfig;
    }

    protected async publishPackage(_context: SdkGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        await this.writeForDownload(context);
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        const projectFiles = this.generateProjectFiles(context);
        context.project.addSourceFiles(...projectFiles);
        await context.project.persist();
    }

    private generateProjectFiles(context: SdkGeneratorContext): SwiftFile[] {
        const files: SwiftFile[] = [];

        // Client.swift
        const rootClientGenerator = new RootClientGenerator({
            projectNamePascalCase: "Petstore", // TODO: Make dynamic
            package_: context.ir.rootPackage,
            context
        });
        files.push(rootClientGenerator.generate());

        // Resources/**/*.swift
        Object.entries(context.ir.subpackages).forEach(([_, subpackage]) => {
            const service = subpackage.service != null ? context.getHttpServiceOrThrow(subpackage.service) : undefined;
            const subclientGenerator = new SubClientGenerator({
                context,
                subpackage,
                serviceId: subpackage.service,
                service
            });
            files.push(subclientGenerator.generate());
        });

        // Schemas/**/*.swift
        const modelFiles = generateModels({ context });
        files.push(...modelFiles);

        return files;
    }
}
