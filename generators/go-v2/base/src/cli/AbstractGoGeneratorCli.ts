import { AbstractGeneratorCli, parseIR } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { BaseGoCustomConfigSchema } from "@fern-api/go-ast";
import { AbstractGoGeneratorContext } from "../context/AbstractGoGeneratorContext";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";

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
}
