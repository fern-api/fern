import { AbstractCsharpGeneratorCli, CSharpFile, CsharpProject } from "@fern-api/csharp-codegen";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernGeneratorExec, GeneratorNotificationService } from "@fern-api/generator-commons";
import { EnumTypeDeclaration, IntermediateRepresentation, ObjectTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { EnumGenerator } from "./enum/EnumGenerator";
import { ModelCustomConfigSchema } from "./ModelCustomConfig";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { ObjectGenerator } from "./object/ObjectGenerator";

export class ModelGeneratorCLI extends AbstractCsharpGeneratorCli<ModelCustomConfigSchema, ModelGeneratorContext> {
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
        return parsed ?? {};
    }

    protected async publishPackage(context: ModelGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: ModelGeneratorContext): Promise<void> {
        const generatedTypes = this.generateTypes({ context });
        for (const file of generatedTypes) {
            project.addSourceFiles(file);
        }
        await project.persist(AbsoluteFilePath.of(context.config.output.path));
    }

    protected async writeForDownload(context: ModelGeneratorContext): Promise<void> {
        const generatedTypes = this.generateTypes({ context });
        for (const file of generatedTypes) {
            project.addSourceFiles(file);
        }
        await project.persist(AbsoluteFilePath.of(context.config.output.path));
    }

    private generateTypes({ context }: { context: ModelGeneratorContext }): CSharpFile[] {
        const files: CSharpFile[] = [];
        for (const [_, typeDeclaration] of Object.entries(context.ir.types)) {
            const file = typeDeclaration.shape._visit<CSharpFile | undefined>({
                alias: () => undefined,
                enum: (etd: EnumTypeDeclaration) => {
                    return new EnumGenerator(context, typeDeclaration, etd).generate();
                },
                object: (otd: ObjectTypeDeclaration) => {
                    return new ObjectGenerator(context, typeDeclaration, otd).generate();
                },
                undiscriminatedUnion: () => undefined,
                union: () => undefined,
                _other: () => undefined
            });
            if (file != null) {
                files.push(file);
            }
        }
        return files;
    }
}
