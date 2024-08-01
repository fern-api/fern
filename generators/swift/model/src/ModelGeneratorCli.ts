/* eslint-disable no-console */
import { AbstractGeneratorCli, AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/generator-commons";
import { SwiftFile } from "@fern-api/swift-codegen";
import { EnumTypeDeclaration, IntermediateRepresentation, ObjectTypeDeclaration } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { readFile } from "fs/promises";
import { z } from "zod";
import EnumBuilder from "./builders/EnumBuilder";
import ObjectBuilder from "./builders/ObjectBuilder";
import TypeAliasBuilder from "./builders/TypeAliasBuilder";
import UndiscriminatedUnionBuilder from "./builders/UndiscriminatedUnionBuilder";

// Generate Models

export function generateModels({ context }: { context: ModelGeneratorContext }): SwiftFile[] {

    const files: SwiftFile[] = [];

    for (const [_, typeDeclaration] of Object.entries(context.ir.types)) {

        // Build file for declaration
        const file = typeDeclaration.shape._visit<SwiftFile | undefined>({
            alias:                            () => new TypeAliasBuilder(context, typeDeclaration).build(),
            enum:     (etd: EnumTypeDeclaration) => new EnumBuilder(context, typeDeclaration, etd).build(),
            object: (otd: ObjectTypeDeclaration) => new ObjectBuilder(context, typeDeclaration, otd).build(),
            undiscriminatedUnion:             () => new UndiscriminatedUnionBuilder(context, typeDeclaration).build(),
            union: () => undefined,
            _other: () => undefined
        });

        // Add file if defined
        if (file) {
            files.push(file);
        }

    }

    return files;

}

// BaseSwiftCustomConfigSchema

export const BaseSwiftCustomConfigSchema = z.object({});

export type BaseSwiftCustomConfigSchema = z.infer<typeof BaseSwiftCustomConfigSchema>;

// AbstractSwiftGeneratorContext

export abstract class AbstractSwiftGeneratorContext<
    CustomConfig extends BaseSwiftCustomConfigSchema
> extends AbstractGeneratorContext {
    
    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
    }

}

// AbstractSwiftGeneratorCli

export abstract class AbstractSwiftGeneratorCli<
    CustomConfig extends BaseSwiftCustomConfigSchema,
    SwiftGeneratorContext extends AbstractSwiftGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, IntermediateRepresentation, SwiftGeneratorContext> {

    /**
     * Parses the IR for the generator
     * @param irFilepath
     * @returns
     */
    protected async parseIntermediateRepresentation(irFilepath: string): Promise<IntermediateRepresentation> {
        const rawIr = (await readFile(irFilepath)).toString();
        const parsedIr = JSON.parse(rawIr);
        return IrSerialization.IntermediateRepresentation.parseOrThrow(parsedIr, {
            unrecognizedObjectKeys: "passthrough"
        });
    }
    
}

// ModelGeneratorContext 

export class ModelGeneratorContext extends AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema> {
    
}

// ModelGeneratorCLI

export class ModelGeneratorCLI extends AbstractSwiftGeneratorCli<BaseSwiftCustomConfigSchema, ModelGeneratorContext> {

    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: BaseSwiftCustomConfigSchema;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): ModelGeneratorContext {
        return new ModelGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): BaseSwiftCustomConfigSchema {
        const parsed = customConfig != null ? BaseSwiftCustomConfigSchema.parse(customConfig) : undefined;
        return parsed ?? {};
    }

    protected async publishPackage(context: ModelGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: ModelGeneratorContext): Promise<void> {
        // eslint-disable-next-line no-console
        const generatedModels = generateModels({ context });
        const generatedFiles = generatedModels.map(model => model.generate());
        await Promise.all(generatedFiles);
    }

    protected async writeForDownload(context: ModelGeneratorContext): Promise<void> {
        // eslint-disable-next-line no-console
        console.log("writeForDownload");
        const generatedTypes = generateModels({ context });
        // eslint-disable-next-line no-console
        console.log(generatedTypes);
        // for (const file of generatedTypes) {
        //     context.project.addSourceFiles(file);
        // }
        // await context.project.persist();
    }

}
