import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFilepath, TypeReference } from "@fern-fern/ir-model";
import { CustomWireMessageEncoding, HttpResponse } from "@fern-fern/ir-model/services";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { convertEncoding } from "./convertEncoding";

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
            rawEncoding: undefined,
            nonStandardEncodings,
        }),
        type: response != null ? parseTypeReference(response) : TypeReference.void(),
    };
}
