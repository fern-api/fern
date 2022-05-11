import { CustomWireMessageEncoding, FernFilepath, Type, WireMessage, WireMessageEncoding } from "@fern-api/api";
import { WireMessageSchema } from "@fern-api/syntax-analysis/src/schemas/WireMessageSchema";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { convertType } from "../type-definitions/convertTypeDefinition";

export function convertWireMessage({
    wireMessage,
    fernFilepath,
    imports,
    nonStandardEncodings,
}: {
    wireMessage: WireMessageSchema;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
    nonStandardEncodings: CustomWireMessageEncoding[];
}): WireMessage {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });

    const encoding = getEncoding(typeof wireMessage !== "string" ? wireMessage.encoding : undefined);
    if (encoding._type === "custom") {
        nonStandardEncodings.push(encoding);
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

const DEFAULT_ENCODING = WireMessageEncoding.json();

function getEncoding(rawEncoding: string | undefined): WireMessageEncoding {
    if (rawEncoding == null) {
        return DEFAULT_ENCODING;
    }
    switch (rawEncoding) {
        case "json":
            return WireMessageEncoding.json();
        default:
            return WireMessageEncoding.custom({
                encoding: rawEncoding,
            });
    }
}
