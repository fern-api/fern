import { FernFilepath, Type, WireMessage } from "@fern-api/api";
import { WireMessageSchema } from "@fern-api/syntax-analysis/src/schemas/WireMessageSchema";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { convertType } from "../type-definitions/convertTypeDefinition";

export function convertWireMessage({
    wireMessage,
    fernFilepath,
    imports,
}: {
    wireMessage: WireMessageSchema;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): WireMessage {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });

    return {
        docs: typeof wireMessage !== "string" ? wireMessage.docs : undefined,
        type:
            typeof wireMessage === "string"
                ? Type.alias({ aliasOf: parseTypeReference(wireMessage) })
                : convertType({ typeDefinition: wireMessage, fernFilepath, imports }),
    };
}
