// import { AbstractCsharpGeneratorCli } from "@fern-api/csharp-codegen";
import { AbstractGeneratorCli, AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/generator-commons";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { readFile } from "fs/promises";
import { z } from "zod";
// import { generateModels } from "./generateModels";

// Generate Models

export function generateModels({ context }: { context: ModelGeneratorContext }): void {

    // eslint-disable-next-line no-console
    console.log(context);

    // const files: CSharpFile[] = [];
    // for (const [_, typeDeclaration] of Object.entries(context.ir.types)) {
    //     const file = typeDeclaration.shape._visit<CSharpFile | undefined>({
    //         alias: () => undefined,
    //         enum: (etd: EnumTypeDeclaration) => {
    //             return new EnumGenerator(context, typeDeclaration, etd).generate();
    //         },
    //         object: (otd: ObjectTypeDeclaration) => {
    //             return new ObjectGenerator(context, typeDeclaration, otd).generate();
    //         },
    //         undiscriminatedUnion: () => undefined,
    //         union: () => undefined,
    //         _other: () => undefined
    //     });
    //     if (file != null) {
    //         files.push(file);
    //     }
    // }
    // return files;
}

// BaseSwiftCustomConfigSchema

export const BaseSwiftCustomConfigSchema = z.object({
    namespace: z.string().optional()
});

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
        // eslint-disable-next-line no-console
        console.log(customConfig);
        // eslint-disable-next-line no-console
        console.log(generatorNotificationService);
    }

}

// AbstractSwiftGeneratorCli
// Should live in the codegen/src/cli??

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
        console.log("writeForGithub");
        const generatedTypes = generateModels({ context });
        // eslint-disable-next-line no-console
        console.log(generatedTypes);
        // for (const file of generatedTypes) {
        //     context.project.addSourceFiles(file);
        // }
        // await context.project.persist();
    }

    protected async writeForDownload(context: ModelGeneratorContext): Promise<void> {
        // eslint-disable-next-line no-console
        console.log("writeForDownload");
        const generatedTypes = generateModels({ context });
        // eslint-disable-next-line no-console
        console.log(generatedTypes);
    }

}
