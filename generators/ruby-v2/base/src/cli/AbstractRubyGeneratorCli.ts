import { AbstractGeneratorCli, parseIR } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { File } from "@fern-api/base-generator";
import { BaseRubyCustomConfigSchema } from "@fern-api/ruby-ast";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { AbstractRubyGeneratorContext } from "../context/AbstractRubyGeneratorContext";

export abstract class AbstractRubyGeneratorCli<
    CustomConfig extends BaseRubyCustomConfigSchema,
    RubyGeneratorContext extends AbstractRubyGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, IntermediateRepresentation, RubyGeneratorContext> {
    /**
     * Parses the IR for the PHP generators
     * @param irFilepath
     * @returns
     */
    protected async parseIntermediateRepresentation(irFilepath: string): Promise<IntermediateRepresentation> {
        return await parseIR<IntermediateRepresentation>({
            absolutePathToIR: AbsoluteFilePath.of(irFilepath),
            parse: IrSerialization.IntermediateRepresentation.parse
        });
    }

    protected async generateMetadata(context: RubyGeneratorContext): Promise<void> {
        const content = JSON.stringify(context.ir.generationMetadata, null, 2);
        context.project.addRawFiles(
            new File(this.GENERATION_METADATA_FILENAME, this.GENERATION_METADATA_FILEPATH, content)
        );
    }
}
