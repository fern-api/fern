import { AbstractGeneratorCli, File, parseIR } from "@fern-api/base-generator";
import { CsharpConfigSchema } from "@fern-api/csharp-codegen";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";

import { GeneratorContext } from "../context/GeneratorContext";

export abstract class AbstractCsharpGeneratorCli extends AbstractGeneratorCli<
    CsharpConfigSchema,
    IntermediateRepresentation,
    GeneratorContext
> {
    /**
     * Parses the IR for the Csharp generators
     * @param irFilepath
     * @returns
     */
    protected async parseIntermediateRepresentation(irFilepath: string): Promise<IntermediateRepresentation> {
        return await parseIR<IntermediateRepresentation>({
            absolutePathToIR: AbsoluteFilePath.of(irFilepath),
            parse: IrSerialization.IntermediateRepresentation.parse
        });
    }

    protected async generateMetadata(context: GeneratorContext): Promise<void> {
        const content = JSON.stringify(context.ir.generationMetadata, null, 2);
        context.project.addRawFiles(
            new File(this.GENERATION_METADATA_FILENAME, this.GENERATION_METADATA_FILEPATH, content)
        );
    }
}
