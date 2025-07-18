import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractRustGeneratorCli } from "@fern-api/rust-base";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { ModelCustomConfigSchema } from "./ModelCustomConfig";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { Writer } from "@fern-api/rust-ast";

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
        // Generate lib.rs
        const libContent = this.generateLibRs(context);
        context.project.addSourceFile(RelativeFilePath.of("src/lib.rs"), libContent);

        // Generate models
        this.generateModels(context);

        await context.project.persist();
    }

    private generateLibRs(context: ModelGeneratorContext): string {
        const writer = new Writer();
        writer.writeLine("//! Generated models by Fern");
        writer.newLine();
        
        // Add module declarations for each type
        if (context.ir.types) {
            Object.keys(context.ir.types).forEach(typeId => {
                const typeName = this.getTypeModuleName(typeId);
                writer.writeLine(`pub mod ${typeName};`);
            });
        }

        return writer.toString();
    }

    private generateModels(context: ModelGeneratorContext): void {
        if (!context.ir.types) return;

        Object.entries(context.ir.types).forEach(([typeId, typeDeclaration]) => {
            const moduleName = this.getTypeModuleName(typeId);
            const content = this.generateTypeDeclaration(context, typeDeclaration);
            context.project.addSourceFile(
                RelativeFilePath.of(`src/${moduleName}.rs`),
                content
            );
        });
    }

    private generateTypeDeclaration(
        context: ModelGeneratorContext,
        typeDeclaration: any
    ): string {
        const writer = new Writer();
        
        // Add derives
        const derives = ["Serialize", "Deserialize"];
        if (context.customConfig.deriveDebug) derives.push("Debug");
        if (context.customConfig.deriveClone) derives.push("Clone");
        
        writer.writeLine(`use serde::{Serialize, Deserialize};`);
        writer.newLine();
        writer.writeLine(`#[derive(${derives.join(", ")})]`);
        
        const typeName = typeDeclaration.name.name.pascalCase.safeName;
        
        // For now, generate a simple struct
        writer.writeBlock(`pub struct ${typeName}`, () => {
            writer.writeLine("// TODO: Add fields based on type shape");
        });

        return writer.toString();
    }

    private getTypeModuleName(typeId: string): string {
        // Convert type ID to snake_case module name
        return typeId
            .split("_")
            .join("_")
            .toLowerCase();
    }
} 