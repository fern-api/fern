import { FernFilepath, Type, WireMessage } from "@fern-api/api";
import { WireMessageSchema } from "@fern-api/syntax-analysis/src/schemas/WireMessageSchema";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { convertType } from "../type-definitions/convertTypeDefinition";
import { isRawTypeDefinition } from "../type-definitions/util";

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
        type: isRawTypeDefinition(wireMessage)
            ? convertType({ typeDefinition: wireMessage, fernFilepath, imports })
            : Type.alias({ aliasOf: parseTypeReference(wireMessage) }),
    };
}
