import { FernFilepath, Type, WireMessage } from "@fern-api/api";
import { WireMessageSchema } from "@fern-api/syntax-analysis/src/schemas/WireMessageSchema";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { convertType } from "../type-definitions/convertTypeDefinition";

const STANDARD_ENCODINGS = new Set(["json"]);

export function convertWireMessage({
    wireMessage,
    fernFilepath,
    imports,
    nonStandardEncodings,
}: {
    wireMessage: WireMessageSchema;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
    nonStandardEncodings: Set<string>;
}): WireMessage {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });

    const encoding = typeof wireMessage !== "string" ? wireMessage.encoding : undefined;
    if (encoding != null && !STANDARD_ENCODINGS.has(encoding)) {
        nonStandardEncodings.add(encoding);
    }

    return {
        docs: typeof wireMessage !== "string" ? wireMessage.docs : undefined,
        encoding,
        type:
            typeof wireMessage === "string"
                ? Type.alias({ aliasOf: parseTypeReference(wireMessage) })
                : convertType({ typeDefinition: wireMessage, fernFilepath, imports }),
    };
}
