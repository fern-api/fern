import { AbstractGeneratorCli } from "@fern-api/generator-commons";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { readFile } from "fs/promises";
import { AbstractCsharpGeneratorContext } from "./AbstractCsharpGeneratorContext";

export abstract class AbstractCsharpGeneratorCli<CustomConfig> extends AbstractGeneratorCli<
    CustomConfig,
    IntermediateRepresentation,
    AbstractCsharpGeneratorContext<CustomConfig>
> {
    protected async parseIntermediateRepresentation(irFilepath: string): Promise<IntermediateRepresentation> {
        const rawIr = (await readFile(irFilepath)).toString();
        const parsedIr = JSON.parse(rawIr);
        return IrSerialization.IntermediateRepresentation.parseOrThrow(parsedIr, {
            unrecognizedObjectKeys: "passthrough"
        });
    }
}
