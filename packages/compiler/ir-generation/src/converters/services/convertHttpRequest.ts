import { CustomWireMessageEncoding, FernFilepath, HttpRequest } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { convertInlineTypeDefinition } from "../type-definitions/convertInlineTypeDefinition";
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
    return {
        docs: typeof request !== "string" ? request?.docs : undefined,
        encoding: convertEncoding({
            rawEncoding: typeof request !== "string" ? request?.encoding : undefined,
            nonStandardEncodings,
        }),
        type: convertInlineTypeDefinition({
            typeDefinitionOrShorthand: request,
            getTypeDefinition: (request) => request.type,
            fernFilepath,
            imports,
        }),
    };
}
