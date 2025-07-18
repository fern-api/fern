import { AbstractGeneratorCli, GeneratorNotificationService, parseIR } from "@fern-api/base-generator";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { AbstractRustGeneratorContext } from "../context/AbstractRustGeneratorContext";
import { BaseRustCustomConfigSchema } from "../custom-config";

export abstract class AbstractRustGeneratorCli<
    CustomConfig extends BaseRustCustomConfigSchema,
    GeneratorContext extends AbstractRustGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, IntermediateRepresentation, GeneratorContext> {
    /**
     * Parses the IR from file.
     */
    protected async parseIntermediateRepresentation(irFilepath: string): Promise<IntermediateRepresentation> {
        return await parseIR<IntermediateRepresentation>({
            absolutePathToIR: AbsoluteFilePath.of(irFilepath),
            parse: IrSerialization.IntermediateRepresentation.parse
        });
    }
} 