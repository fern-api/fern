import { AbstractGeneratorCli, parseIR } from "@fern-api/base-generator";
import { BaseCsharpCustomConfigSchema } from "@fern-api/csharp-codegen";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { File } from "@fern-api/base-generator";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";

import { BaseCsharpGeneratorContext } from "../context/BaseCsharpGeneratorContext";

export abstract class AbstractCsharpGeneratorCli<
    CustomConfig extends BaseCsharpCustomConfigSchema,
    CsharpGeneratorContext extends BaseCsharpGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, IntermediateRepresentation, CsharpGeneratorContext> {

    private readonly GENERATION_METADATA_FILEPATH = RelativeFilePath.of("./.fern");
    private readonly GENERATION_METADATA_FILENAME = "metadata.json";

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

    protected async generateMetadata(context: CsharpGeneratorContext): Promise<void> {
        const content = JSON.stringify(context.ir.generationMetadata, null, 2);
        context.project.addRawFiles(
            new File(this.GENERATION_METADATA_FILENAME, this.GENERATION_METADATA_FILEPATH, content)
        );
    }
}
