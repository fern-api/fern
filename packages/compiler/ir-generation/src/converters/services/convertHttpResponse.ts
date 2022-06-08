import { CustomWireMessageEncoding, FernFilepath, HttpResponse } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { convertInlineTypeDefinition } from "../type-definitions/convertInlineTypeDefinition";
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
            type: convertInlineTypeDefinition({
                typeDefinitionOrShorthand: response,
                getTypeDefinition: (response) => (typeof response.ok == "string" ? response.ok : response.ok?.type),
                fernFilepath,
                imports,
            }),
        },
        failed: convertFailedResponse({
            rawFailedResponse: typeof response !== "string" ? response?.failed : undefined,
            fernFilepath,
            imports,
        }),
    };
}
