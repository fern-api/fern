import { readFile } from "fs/promises";

import { AbstractGeneratorCli, parseIR } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";

import { AbstractCsharpGeneratorContext } from "../context/AbstractCsharpGeneratorContext";
import { BaseCsharpCustomConfigSchema } from "../custom-config/BaseCsharpCustomConfigSchema";

export abstract class AbstractCsharpGeneratorCli<
    CustomConfig extends BaseCsharpCustomConfigSchema,
    CsharpGeneratorContext extends AbstractCsharpGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, IntermediateRepresentation, CsharpGeneratorContext> {
    /**
     * Parses the IR for the Csharp generators
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
