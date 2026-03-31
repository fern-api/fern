import { AbstractGeneratorCli, File, parseIR } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { BaseGoCustomConfigSchema } from "@fern-api/go-ast";
import { FernIr } from "@fern-fern/ir-sdk";

type IntermediateRepresentation = FernIr.IntermediateRepresentation;

import { serialization as IrSerialization } from "@fern-fern/ir-sdk";
import { AbstractGoGeneratorContext } from "../context/AbstractGoGeneratorContext.js";

export abstract class AbstractGoGeneratorCli<
    CustomConfig extends BaseGoCustomConfigSchema,
    GoGeneratorContext extends AbstractGoGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, IntermediateRepresentation, GoGeneratorContext> {
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

    protected async generateMetadata(context: GoGeneratorContext): Promise<void> {
        // Go convention requires version strings to have a "v" prefix
        let sdkVersion = context.version;
        if (sdkVersion != null && sdkVersion !== "" && !sdkVersion.startsWith("v")) {
            sdkVersion = "v" + sdkVersion;
        }
        const metadata = {
            ...context.ir.generationMetadata,
            sdkVersion
        };
        const content = JSON.stringify(metadata, null, 2);
        if (context.project != null && File != null) {
            context.project.addRawFiles(
                new File(this.GENERATION_METADATA_FILENAME, this.GENERATION_METADATA_FILEPATH, content)
            );
        }
    }
}
