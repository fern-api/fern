import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractSwiftGeneratorCli, SwiftFile } from "@fern-api/swift-base";
import { generateInlinedRequestModels, generateModels } from "@fern-api/swift-model";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import {
    PackageSwiftGenerator,
    RootClientGenerator,
    SingleUrlEnvironmentGenerator,
    SubClientGenerator
} from "./generators";

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
        const [rootFiles, sourceFiles] = await Promise.all([
            this.generateRootFiles(context),
            this.generateSourceFiles(context)
        ]);
        context.project.addRootFiles(...rootFiles);
        context.project.addSourceFiles(...sourceFiles);
        await context.project.persist();
    }

    private async generateRootFiles(context: SdkGeneratorContext): Promise<SwiftFile[]> {
        const files: SwiftFile[] = [];
        const packageSwiftGenerator = new PackageSwiftGenerator({
            sdkGeneratorContext: context
        });
        files.push(packageSwiftGenerator.generate());
        return files;
    }

    private async generateSourceFiles(context: SdkGeneratorContext): Promise<SwiftFile[]> {
        const files: SwiftFile[] = [];

        // Resources/**/*.swift
        Object.entries(context.ir.subpackages).forEach(([subpackageId, subpackage]) => {
            const subclientGenerator = new SubClientGenerator({
                clientName: context.project.symbolRegistry.getSubClientSymbolOrThrow(subpackageId),
                subpackage,
                sdkGeneratorContext: context
            });
            files.push(subclientGenerator.generate());
        });

        // Requests/**/*.swift
        const inlinedRequestFiles = generateInlinedRequestModels({ context });
        files.push(...inlinedRequestFiles);

        // Schemas/**/*.swift
        const modelFiles = generateModels({ context });
        files.push(...modelFiles);

        // {ProjectName}Client.swift
        const rootClientGenerator = new RootClientGenerator({
            clientName: context.project.symbolRegistry.getRootClientSymbolOrThrow(),
            package_: context.ir.rootPackage,
            sdkGeneratorContext: context
        });
        files.push(rootClientGenerator.generate());

        // {ProjectName}Environment.swift
        if (context.ir.environments && context.ir.environments.environments.type === "singleBaseUrl") {
            const environmentGenerator = new SingleUrlEnvironmentGenerator({
                enumName: context.project.symbolRegistry.getEnvironmentSymbolOrThrow(),
                environments: context.ir.environments.environments,
                sdkGeneratorContext: context
            });
            files.push(environmentGenerator.generate());
        } else {
            // TODO(kafkas): Handle multiple environments
        }

        return files;
    }
}
