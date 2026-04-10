import { AbstractGeneratorCli, File, parseIR } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { BasePhpCustomConfigSchema } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { AbstractPhpGeneratorContext } from "../context/AbstractPhpGeneratorContext.js";

export abstract class AbstractPhpGeneratorCli<
    CustomConfig extends BasePhpCustomConfigSchema,
    PhpGeneratorContext extends AbstractPhpGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, FernIr.IntermediateRepresentation, PhpGeneratorContext> {
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

    protected async generateMetadata(context: PhpGeneratorContext): Promise<void> {
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
