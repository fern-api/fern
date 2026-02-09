import { AbstractGeneratorCli, File, parseIR } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { AbstractPythonGeneratorContext } from "../context/AbstractPythonGeneratorContext.js";
import { BasePythonCustomConfigSchema } from "../custom-config/BasePythonCustomConfigSchema.js";

export abstract class AbstractPythonGeneratorCli<
    CustomConfig extends BasePythonCustomConfigSchema,
    PythonGeneratorContext extends AbstractPythonGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, FernIr.IntermediateRepresentation, PythonGeneratorContext> {
    /**
     * Parses the IR for the Python generators
     * @param irFilepath
     * @returns
     */
    protected async parseIntermediateRepresentation(irFilepath: string): Promise<FernIr.IntermediateRepresentation> {
        return await parseIR<FernIr.IntermediateRepresentation>({
            absolutePathToIR: AbsoluteFilePath.of(irFilepath),
            parse: IrSerialization.IntermediateRepresentation.parse
        });
    }

    protected async generateMetadata(context: PythonGeneratorContext): Promise<void> {
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
