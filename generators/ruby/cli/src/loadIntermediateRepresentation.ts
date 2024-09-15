import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { parseIR } from "@fern-api/generator-commons";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";

export async function loadIntermediateRepresentation(pathToFile: string): Promise<IntermediateRepresentation> {
    return await parseIR<IntermediateRepresentation>({
        absolutePathToIR: AbsoluteFilePath.of(pathToFile),
        parse: IrSerialization.IntermediateRepresentation.parse
    });
}
