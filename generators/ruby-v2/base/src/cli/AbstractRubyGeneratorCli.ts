import { AbstractGeneratorCli, File, parseIR } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { BaseRubyCustomConfigSchema } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { AbstractRubyGeneratorContext } from "../context/AbstractRubyGeneratorContext.js";

export abstract class AbstractRubyGeneratorCli<
    CustomConfig extends BaseRubyCustomConfigSchema,
    RubyGeneratorContext extends AbstractRubyGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, FernIr.IntermediateRepresentation, RubyGeneratorContext> {
    /**
     * Parses the IR for the PHP generators
     * @param irFilepath
     * @returns
     */
    protected async parseIntermediateRepresentation(irFilepath: string): Promise<FernIr.IntermediateRepresentation> {
        return await parseIR<FernIr.IntermediateRepresentation>({
            absolutePathToIR: AbsoluteFilePath.of(irFilepath),
            parse: IrSerialization.IntermediateRepresentation.parse
        });
    }

    protected async generateMetadata(context: RubyGeneratorContext): Promise<void> {
        const metadata = {
            ...context.ir.generationMetadata,
            sdkVersion: context.version
        };
        const content = JSON.stringify(metadata, null, 2);
        context.project.addRawFiles(
            new File(this.GENERATION_METADATA_FILENAME, this.GENERATION_METADATA_FILEPATH, content)
        );
    }
}
