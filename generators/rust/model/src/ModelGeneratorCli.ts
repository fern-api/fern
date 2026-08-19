import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractRustGeneratorCli, formatRustCode, RustFile } from "@fern-api/rust-base";
import { Writer } from "@fern-api/rust-codegen";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { collectModuleExports } from "./collectModuleExports.js";
import { MODEL_FILE_MANIFEST_PATH, ModelFileManifest } from "./ModelFileManifest.js";
import { generateModels } from "./generateModels.js";
import { ModelCustomConfigSchema } from "./ModelCustomConfig.js";
import { ModelGeneratorContext } from "./ModelGeneratorContext.js";

export class ModelGeneratorCli extends AbstractRustGeneratorCli<ModelCustomConfigSchema, ModelGeneratorContext> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: FernIr.IntermediateRepresentation;
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

    protected publishPackage(_context: ModelGeneratorContext): Promise<void> {
        throw new Error("Publishing is not supported for model generator");
    }

    protected async writeForGithub(context: ModelGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async writeForDownload(context: ModelGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async generate(context: ModelGeneratorContext): Promise<void> {
        context.logger.debug(
            `Starting model generation for ${context.case.pascalSafe(context.ir.apiName)} (crate: ${context.getCrateName()}@${context.getCrateVersion()})`
        );

        const files: RustFile[] = [];

        // Generate lib.rs
        context.logger.debug("Generating lib.rs entry point...");
        const libContent = this.generateLibRs(context);
        const libFile = new RustFile({
            filename: "lib.rs",
            directory: RelativeFilePath.of("src"),
            fileContents: libContent
        });
        files.push(libFile);

        // Generate models using the new generator system FIRST
        // This populates the generatedFilenames Set with all type filenames
        const typeCount = Object.keys(context.ir.types).length;
        const serviceCount = Object.keys(context.ir.services).length;
        context.logger.debug(`Generating ${typeCount} type model(s) and ${serviceCount} service model(s)...`);
        const modelFiles = generateModels({ context });
        context.logger.debug(`Generated ${modelFiles.length} model file(s)`);
        files.push(...modelFiles);

        // Generate mod.rs for types directory AFTER models
        // This ensures we use the correct filenames (with _type suffix if there were collisions)
        context.logger.debug("Generating types/mod.rs module file...");
        const typesModFile = this.generateTypesModFile(context);
        files.push(typesModFile);

        context.logger.debug(
            `Persisting ${files.length} file(s) to ${context.project.absolutePathToOutputDirectory}...`
        );
        context.project.addSourceFiles(...files);
        await context.project.persist();
        context.logger.debug("File persistence complete");

        context.logger.debug("Formatting Rust code with rustfmt...");
        await formatRustCode({
            outputDir: context.project.absolutePathToOutputDirectory,
            logger: context.logger
        });
        context.logger.debug("Code formatting complete");

        if (context.customConfig.emitFileManifest) {
            await this.writeFileManifest(context);
        }
    }

    /**
     * Record which IR element produced each generated module so a caller can
     * distribute the files across several crates without having to reimplement
     * the filename registry's collision handling.
     */
    private async writeFileManifest(context: ModelGeneratorContext): Promise<void> {
        const manifest: ModelFileManifest = {
            modules: collectModuleExports(context).map(({ filename, moduleName, typeName, owner }) => ({
                filename,
                moduleName,
                typeName,
                owner
            }))
        };
        const manifestPath = join(context.project.absolutePathToOutputDirectory, MODEL_FILE_MANIFEST_PATH);
        await mkdir(dirname(manifestPath), { recursive: true });
        await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
        context.logger.debug(`Wrote file manifest for ${manifest.modules.length} module(s) to ${manifestPath}`);
    }

    private generateLibRs(context: ModelGeneratorContext): string {
        const writer = new Writer();
        writer.writeLine("//! Generated models by Fern");
        writer.newLine();

        // Add error module (BuildError for builders)
        writer.writeLine("pub mod error;");
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

        // Add module documentation
        const apiName = context.ir.apiDisplayName ?? context.case.pascalSafe(context.ir.apiName) ?? "API";
        writer.writeLine(`//! Request and response types for the ${apiName}`);
        writer.writeLine("//!");
        writer.writeLine("//! This module contains all data structures used for API communication,");
        writer.writeLine("//! including request bodies, response types, and shared models.");

        const moduleExports = collectModuleExports(context);
        const requestTypeCount = moduleExports.filter((moduleExport) => moduleExport.isRequestType).length;
        const modelTypeCount = moduleExports.length - requestTypeCount;

        // Add documentation summary if we have types
        if (moduleExports.length > 0) {
            writer.writeLine("//!");
            if (requestTypeCount > 0 || modelTypeCount > 0) {
                writer.writeLine("//! ## Type Categories");
                writer.writeLine("//!");
                if (requestTypeCount > 0) {
                    writer.writeLine(`//! - **Request/Response Types**: ${requestTypeCount} types for API operations`);
                }
                if (modelTypeCount > 0) {
                    writer.writeLine(`//! - **Model Types**: ${modelTypeCount} types for data representation`);
                }
            }
        }

        writer.newLine();

        // Add module declarations for each unique type
        moduleExports.forEach(({ moduleName }) => {
            writer.writeLine(`pub mod ${moduleName};`);
        });

        writer.newLine();

        // Add public use statements with named exports for each unique type
        moduleExports.forEach(({ moduleName, typeName }) => {
            writer.writeLine(`pub use ${moduleName}::${typeName};`);
        });

        writer.newLine();

        return new RustFile({
            filename: "mod.rs",
            directory: RelativeFilePath.of("src"),
            fileContents: writer.toString()
        });
    }
}
