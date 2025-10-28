import { GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractRustGeneratorCli, formatRustCode, RustFile } from "@fern-api/rust-base";
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
            `Starting model generation for ${context.ir.apiName.pascalCase.safeName} (crate: ${context.getCrateName()}@${context.getCrateVersion()})`
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
        // TODO: @iamnamananand996 - (remove this after testing it end to end) Theoretically unnecessary - registry ensures unique filenames → unique modules
        const uniqueModuleNames = new Set<string>();
        const moduleExports: Array<{ moduleName: string; typeName: string }> = [];

        // Collect unique module names and their corresponding type names from IR types
        if (context.ir.types) {
            Object.values(context.ir.types).forEach((typeDeclaration) => {
                // Use centralized method to get unique filename and extract module name from it
                const filename = context.getUniqueFilenameForType(typeDeclaration);
                const rawModuleName = filename.replace(".rs", ""); // Remove .rs extension
                const escapedModuleName = context.escapeRustKeyword(rawModuleName);
                // Use getUniqueTypeNameForDeclaration to prevent type name conflicts
                const typeName = context.getUniqueTypeNameForDeclaration(typeDeclaration);

                // Only add if we haven't seen this module name before
                if (!uniqueModuleNames.has(escapedModuleName)) {
                    uniqueModuleNames.add(escapedModuleName);
                    moduleExports.push({ moduleName: escapedModuleName, typeName });
                }
            });
        }

        // Add inline request body types
        for (const service of Object.values(context.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.requestBody?.type === "inlinedRequestBody") {
                    const filename = context.getFilenameForInlinedRequestBody(endpoint.id);
                    const rawModuleName = filename.replace(".rs", "");
                    const escapedModuleName = context.escapeRustKeyword(rawModuleName);
                    const typeName = context.getInlineRequestTypeName(endpoint.id);

                    if (!uniqueModuleNames.has(escapedModuleName)) {
                        uniqueModuleNames.add(escapedModuleName);
                        moduleExports.push({ moduleName: escapedModuleName, typeName });
                    }
                }
            }
        }

        // Add file upload request body types
        for (const service of Object.values(context.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.requestBody?.type === "fileUpload") {
                    const filename = context.getFilenameForFileUploadRequestBody(endpoint.id);
                    const rawModuleName = filename.replace(".rs", "");
                    const escapedModuleName = context.escapeRustKeyword(rawModuleName);
                    const typeName = context.getFileUploadRequestTypeName(endpoint.id);

                    if (!uniqueModuleNames.has(escapedModuleName)) {
                        uniqueModuleNames.add(escapedModuleName);
                        moduleExports.push({ moduleName: escapedModuleName, typeName });
                    }
                }
            }
        }

        // Add query request types
        for (const [serviceId, service] of Object.entries(context.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.queryParameters.length > 0 && !endpoint.requestBody) {
                    const filename = context.getFilenameForQueryRequest(endpoint.id);
                    const rawModuleName = filename.replace(".rs", "");
                    const escapedModuleName = context.escapeRustKeyword(rawModuleName);
                    const typeName = context.getQueryRequestUniqueTypeName(endpoint.id);

                    if (!uniqueModuleNames.has(escapedModuleName)) {
                        uniqueModuleNames.add(escapedModuleName);
                        moduleExports.push({ moduleName: escapedModuleName, typeName });
                    }
                }
            }
        }

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
