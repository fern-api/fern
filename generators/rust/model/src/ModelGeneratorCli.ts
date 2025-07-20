import { GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Writer } from "@fern-api/rust-codegen";
import { AbstractRustGeneratorCli, RustFile } from "@fern-api/rust-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation, TypeDeclaration } from "@fern-fern/ir-sdk/api";

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

        // Generate models
        const modelFiles = this.generateModels(context);
        files.push(...modelFiles);

        context.project.addSourceFiles(...files);
        await context.project.persist();
    }

    private generateLibRs(context: ModelGeneratorContext): string {
        const writer = new Writer();
        writer.writeLine("//! Generated models by Fern");
        writer.newLine();

        // Add module declarations for each type
        if (context.ir.types) {
            Object.values(context.ir.types).forEach((typeDeclaration) => {
                const typeName = this.getTypeModuleName(typeDeclaration);
                writer.writeLine(`pub mod ${typeName};`);
            });
        }

        return writer.toString();
    }

    private generateModels(context: ModelGeneratorContext): RustFile[] {
        if (!context.ir.types) {
            return [];
        }

        return Object.values(context.ir.types).map((typeDeclaration) => {
            const moduleName = this.getTypeModuleName(typeDeclaration);
            const content = this.generateTypeDeclaration(context, typeDeclaration);
            return new RustFile({
                filename: `${moduleName}.rs`,
                directory: RelativeFilePath.of("src"),
                fileContents: content
            });
        });
    }

    private generateTypeDeclaration(context: ModelGeneratorContext, typeDeclaration: TypeDeclaration): string {
        const writer = new Writer();

        // Add derives
        const derives = ["Serialize", "Deserialize"];
        if (context.customConfig.deriveDebug) {
            derives.push("Debug");
        }
        if (context.customConfig.deriveClone) {
            derives.push("Clone");
        }

        writer.writeLine("use serde::{Serialize, Deserialize};");
        writer.newLine();
        writer.writeLine(`#[derive(${derives.join(", ")})]`);

        const typeName = typeDeclaration.name.name.pascalCase.safeName;

        // For now, generate a simple struct
        writer.writeBlock(`pub struct ${typeName}`, () => {
            writer.writeLine("// TODO: Add fields based on type shape");
        });

        return writer.toString();
    }

    private getTypeModuleName(typeDeclaration: TypeDeclaration): string {
        // Use the proper snake_case name from the IR
        return typeDeclaration.name.name.snakeCase.safeName;
    }
}
