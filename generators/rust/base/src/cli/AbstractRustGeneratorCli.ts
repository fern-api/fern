import { AbstractGeneratorCli, parseIR } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { BaseRustCustomConfigSchema } from "../config";
import { AbstractRustGeneratorContext } from "../context/AbstractRustGeneratorContext";

export abstract class AbstractRustGeneratorCli<
    CustomConfig extends BaseRustCustomConfigSchema,
    RustGeneratorContext extends AbstractRustGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, IntermediateRepresentation, RustGeneratorContext> {
    protected async parseIntermediateRepresentation(irFilepath: string): Promise<IntermediateRepresentation> {
        return await parseIR<IntermediateRepresentation>({
            absolutePathToIR: AbsoluteFilePath.of(irFilepath),
            parse: IrSerialization.IntermediateRepresentation.parse
        });
    }
}
