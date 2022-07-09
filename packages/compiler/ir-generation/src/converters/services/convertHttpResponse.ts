import { RawSchemas } from "@fern-api/syntax-analysis";
import { FernFilepath, TypeReference } from "@fern-fern/ir-model";
import { CustomWireMessageEncoding, HttpResponse } from "@fern-fern/ir-model/services";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { convertEncoding } from "./convertEncoding";
import { convertFailedResponse } from "./convertFailedResponse";

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
    return {
        docs: typeof response !== "string" ? response?.docs : undefined,
        encoding: convertEncoding({
            rawEncoding: typeof response !== "string" ? response?.encoding : undefined,
            nonStandardEncodings,
        }),
        ok: {
            docs: typeof response !== "string" && typeof response?.ok !== "string" ? response?.ok?.docs : undefined,
            type: getResponseTypeReference({ fernFilepath, imports, response }),
        },
        failed: convertFailedResponse({
            rawFailedResponse: typeof response !== "string" ? response?.failed : undefined,
            fernFilepath,
            imports,
        }),
    };
}

function getResponseTypeReference({
    fernFilepath,
    imports,
    response,
}: {
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
    response: RawSchemas.HttpResponseSchema | undefined;
}): TypeReference {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });
    if (response == null) {
        return TypeReference.void();
    } else if (typeof response === "string") {
        return parseTypeReference(response);
    } else if (response.ok == null) {
        return TypeReference.void();
    }
    return parseTypeReference(response.ok);
}
