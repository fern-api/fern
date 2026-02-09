import { AbstractGeneratorCli, parseIR } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { AbstractTypescriptMcpGeneratorContext } from "../context/AbstractTypescriptMcpGeneratorContext.js";

export abstract class AbstractTypescriptMcpGeneratorCli<
    CustomConfig extends TypescriptCustomConfigSchema,
    TypescriptMcpGeneratorContext extends AbstractTypescriptMcpGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, FernIr.IntermediateRepresentation, TypescriptMcpGeneratorContext> {
    /**
     * Parses the IR for the typescript mcp generators
     * @param irFilepath
     * @returns
     */
    protected async parseIntermediateRepresentation(irFilepath: string): Promise<FernIr.IntermediateRepresentation> {
        return await parseIR<FernIr.IntermediateRepresentation>({
            absolutePathToIR: AbsoluteFilePath.of(irFilepath),
            parse: IrSerialization.IntermediateRepresentation.parse
        });
    }

    protected async generateMetadata(context: TypescriptMcpGeneratorContext): Promise<void> {
        context.logger.warn("Typescript MCP Generator doesn't yet support generation metadata");
    }
}
