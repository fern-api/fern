import { AbstractGeneratorCli, parseIR } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { AbstractTypescriptMcpGeneratorContext } from "../context/AbstractTypescriptMcpGeneratorContext";

export abstract class AbstractTypescriptMcpGeneratorCli<
    CustomConfig extends TypescriptCustomConfigSchema,
    TypescriptMcpGeneratorContext extends AbstractTypescriptMcpGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, IntermediateRepresentation, TypescriptMcpGeneratorContext> {
    /**
     * Parses the IR for the typescript mcp generators
     * @param irFilepath
     * @returns
     */
    protected async parseIntermediateRepresentation(irFilepath: string): Promise<IntermediateRepresentation> {
        return await parseIR<IntermediateRepresentation>({
            absolutePathToIR: AbsoluteFilePath.of(irFilepath),
            parse: IrSerialization.IntermediateRepresentation.parse
        });
    }

    protected async generateMetadata(context: TypescriptMcpGeneratorContext): Promise<void> {
        context.logger.warn("Typescript MCP Generator doesn't yet support generation metadata");
    }
}
