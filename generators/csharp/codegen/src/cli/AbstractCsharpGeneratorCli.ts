import { AbstractGeneratorCli } from "@fern-api/generator-commons";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { readFile } from "fs/promises";
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
        const rawIr = (await readFile(irFilepath)).toString();
        const parsedIr = JSON.parse(rawIr);
        return IrSerialization.IntermediateRepresentation.parseOrThrow(parsedIr, {
            unrecognizedObjectKeys: "passthrough"
        });
    }
}
