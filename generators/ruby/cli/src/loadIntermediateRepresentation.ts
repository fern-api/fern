import { parseIR } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

import * as IrSerialization from "@fern-fern/ir-sdk/serialization";

import { FernIrV39 as FernIr } from "@fern-fern/ir-sdk";
export async function loadIntermediateRepresentation(pathToFile: string): Promise<FernIr.IntermediateRepresentation> {
    return await parseIR<FernIr.IntermediateRepresentation>({
        absolutePathToIR: AbsoluteFilePath.of(pathToFile),
        parse: IrSerialization.IntermediateRepresentation.parse
    });
}
