import { CustomWireMessageEncoding, FernFilepath, HttpRequest, Type, TypeReference } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { convertType } from "../type-definitions/convertTypeDefinition";
import { convertEncoding } from "./convertEncoding";

export function convertHttpRequest({
    request,
    fernFilepath,
    imports,
    nonStandardEncodings,
}: {
    request: RawSchemas.HttpRequestSchema | null | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
    nonStandardEncodings: CustomWireMessageEncoding[];
}): HttpRequest {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });
    return {
        docs: typeof request !== "string" ? request?.docs : undefined,
        encoding: convertEncoding({
            rawEncoding: typeof request !== "string" ? request?.encoding : undefined,
            nonStandardEncodings,
        }),
        type:
            request != null
                ? typeof request === "string"
                    ? Type.alias({ aliasOf: parseTypeReference(request) })
                    : convertType({ typeDefinition: request, fernFilepath, imports })
                : Type.alias({ aliasOf: TypeReference.void() }),
    };
}
