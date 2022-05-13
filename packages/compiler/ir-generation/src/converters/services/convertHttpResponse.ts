import { CustomWireMessageEncoding, FernFilepath, HttpResponse, Type, TypeReference } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { convertType } from "../type-definitions/convertTypeDefinition";
import { convertEncoding } from "./convertEncoding";
import { convertResponseErrors } from "./convertResponseErrors";

export function convertHttpResponse({
    response,
    fernFilepath,
    imports,
    nonStandardEncodings,
}: {
    response: RawSchemas.HttpResponseSchema | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
    nonStandardEncodings: CustomWireMessageEncoding[];
}): HttpResponse {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });
    return {
        docs: typeof response !== "string" ? response?.docs : undefined,
        encoding: convertEncoding({
            rawEncoding: typeof response !== "string" ? response?.encoding : undefined,
            nonStandardEncodings,
        }),
        ok:
            typeof response === "string"
                ? Type.alias({ aliasOf: parseTypeReference(response) })
                : response?.ok != null
                ? convertType({ typeDefinition: response.ok, fernFilepath, imports })
                : Type.alias({ aliasOf: TypeReference.void() }),
        errors: convertResponseErrors({
            rawResponseErrors: typeof response !== "string" ? response?.errors : undefined,
            fernFilepath,
            imports,
        }),
    };
}
