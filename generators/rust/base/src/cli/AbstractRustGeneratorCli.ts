import { AbstractGeneratorCli, parseIR } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { BaseRustCustomConfigSchema } from "@fern-api/rust-codegen";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";

import { AbstractRustGeneratorContext } from "../context/AbstractRustGeneratorContext";

export abstract class AbstractRustGeneratorCli<
    CustomConfig extends BaseRustCustomConfigSchema,
    RustGeneratorContext extends AbstractRustGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, IntermediateRepresentation, RustGeneratorContext> {
    /**
     * Parses the IR for the Rust generators
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
