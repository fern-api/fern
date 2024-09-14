import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { AbsoluteFilePath, streamObjectFromFile } from "@fern-api/fs-utils";

export async function loadIntermediateRepresentation(pathToFile: string): Promise<IntermediateRepresentation> {
    const irJson = await streamObjectFromFile(AbsoluteFilePath.of(pathToFile));
    return IrSerialization.IntermediateRepresentation.parseOrThrow(irJson, {
        unrecognizedObjectKeys: "passthrough",
        allowUnrecognizedEnumValues: true,
        allowUnrecognizedUnionMembers: true
    });
}
