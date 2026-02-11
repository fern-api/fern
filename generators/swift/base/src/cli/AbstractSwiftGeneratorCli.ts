import { AbstractGeneratorCli, File, parseIR } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { BaseSwiftCustomConfigSchema } from "@fern-api/swift-codegen";
import { FernIr } from "@fern-fern/ir-sdk";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { AbstractSwiftGeneratorContext } from "../context/AbstractSwiftGeneratorContext.js";

export abstract class AbstractSwiftGeneratorCli<
    CustomConfig extends BaseSwiftCustomConfigSchema,
    SwiftGeneratorContext extends AbstractSwiftGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, FernIr.IntermediateRepresentation, SwiftGeneratorContext> {
    protected async parseIntermediateRepresentation(irFilepath: string): Promise<FernIr.IntermediateRepresentation> {
        return await parseIR<FernIr.IntermediateRepresentation>({
            absolutePathToIR: AbsoluteFilePath.of(irFilepath),
            parse: IrSerialization.IntermediateRepresentation.parse
        });
    }

    protected async generateMetadata(context: SwiftGeneratorContext): Promise<void> {
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
