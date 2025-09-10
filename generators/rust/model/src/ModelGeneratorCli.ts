import { GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractRustGeneratorCli, RustFile, RustFormatter } from "@fern-api/rust-base";
import { Writer } from "@fern-api/rust-codegen";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { generateModels } from "./generateModels";
import { ModelCustomConfigSchema } from "./ModelCustomConfig";
import { ModelGeneratorContext } from "./ModelGeneratorContext";

export class ModelGeneratorCli extends AbstractRustGeneratorCli<ModelCustomConfigSchema, ModelGeneratorContext> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: ModelCustomConfigSchema;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): ModelGeneratorContext {
        return new ModelGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): ModelCustomConfigSchema {
        const parsed = customConfig != null ? ModelCustomConfigSchema.parse(customConfig) : undefined;
        if (parsed != null) {
            return parsed;
        }
        return ModelCustomConfigSchema.parse({});
    }

    protected publishPackage(context: ModelGeneratorContext): Promise<void> {
        throw new Error("Publishing is not supported for model generator");
    }

    protected async writeForGithub(context: ModelGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async writeForDownload(context: ModelGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async generate(context: ModelGeneratorContext): Promise<void> {
        const files: RustFile[] = [];

        // Generate lib.rs
        const libContent = this.generateLibRs(context);
        const libFile = new RustFile({
            filename: "lib.rs",
            directory: RelativeFilePath.of("src"),
            fileContents: libContent
        });
        files.push(libFile);

        // Generate mod.rs for types directory
        const typesModFile = this.generateTypesModFile(context);
        files.push(typesModFile);

        // Generate models using the new generator system
        const modelFiles = generateModels({ context });
        files.push(...modelFiles);

        context.project.addSourceFiles(...files);
        await context.project.persist();

        context.logger.info("=== RUNNING rustfmt ===");
        await RustFormatter.format({
            outputDir: context.project.absolutePathToOutputDirectory,
            logger: context.logger
        });
        context.logger.info("=== RUSTFMT COMPLETE ===");
    }

    private generateLibRs(context: ModelGeneratorContext): string {
        const writer = new Writer();
        writer.writeLine("//! Generated models by Fern");
        writer.newLine();

        // Add types module declaration
        if (context.ir.types && Object.keys(context.ir.types).length > 0) {
            writer.writeLine("pub mod types;");
            writer.newLine();
            writer.writeLine("pub use types::*;");
        }

        return writer.toString();
    }

    private generateTypesModFile(context: ModelGeneratorContext): RustFile {
        const writer = new Writer();

        // Use a Set to track unique module names and prevent duplicates
        const uniqueModuleNames = new Set<string>();
        const moduleNames: string[] = [];

        // Collect unique module names first using centralized method
        if (context.ir.types) {
            Object.values(context.ir.types).forEach((typeDeclaration) => {
                // Use centralized method to get unique filename and extract module name from it
                const filename = context.getUniqueFilenameForType(typeDeclaration);
                const rawModuleName = filename.replace(".rs", ""); // Remove .rs extension
                const escapedModuleName = context.configManager.escapeRustKeyword(rawModuleName);

                // Only add if we haven't seen this module name before
                if (!uniqueModuleNames.has(escapedModuleName)) {
                    uniqueModuleNames.add(escapedModuleName);
                    moduleNames.push(escapedModuleName);
                }
            });
        }

        // Add module declarations for each unique type
        moduleNames.forEach((moduleName) => {
            writer.writeLine(`pub mod ${moduleName};`);
        });

        writer.newLine();

        // Add public use statements for each unique type
        moduleNames.forEach((moduleName) => {
            writer.writeLine(`pub use ${moduleName}::{*};`);
        });

        writer.newLine();

        return new RustFile({
            filename: "mod.rs",
            directory: RelativeFilePath.of("src"),
            fileContents: writer.toString()
        });
    }
}
