import { AbstractGeneratorCli, File, parseIR } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { BaseJavaCustomConfigSchema } from "@fern-api/java-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { AbstractJavaGeneratorContext } from "../context/AbstractJavaGeneratorContext.js";

export abstract class AbstractJavaGeneratorCli<
    CustomConfig extends BaseJavaCustomConfigSchema,
    JavaGeneratorContext extends AbstractJavaGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, FernIr.IntermediateRepresentation, JavaGeneratorContext> {
    /**
     * Parses the IR for the Java generators
     * @param irFilepath
     * @returns
     */
    protected async parseIntermediateRepresentation(irFilepath: string): Promise<FernIr.IntermediateRepresentation> {
        const fullIrPath = process.env.FULL_IR_PATH;
        if (fullIrPath != null && fullIrPath.length > 0) {
            // Full IR is written in raw camelCase format by the orchestrator — read directly
            // without Zod parsing (which would redundantly convert camelCase → camelCase).
            return await parseIR<FernIr.IntermediateRepresentation>({
                absolutePathToIR: AbsoluteFilePath.of(fullIrPath),
                parse: (raw) => ({ ok: true as const, value: raw as FernIr.IntermediateRepresentation })
            });
        }
        // Fallback: read from main IR path with Zod parse (e.g., Docker mode where
        // FULL_IR_PATH is not set and the IR is in wire format)
        return await parseIR<FernIr.IntermediateRepresentation>({
            absolutePathToIR: AbsoluteFilePath.of(irFilepath),
            parse: IrSerialization.IntermediateRepresentation.parse
        });
    }

    protected async generateMetadata(context: JavaGeneratorContext): Promise<void> {
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
