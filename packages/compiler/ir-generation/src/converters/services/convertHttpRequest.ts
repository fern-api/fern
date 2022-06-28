import { RawSchemas } from "@fern-api/syntax-analysis";
import { CustomWireMessageEncoding, FernFilepath, HttpRequest } from "@fern-fern/ir-model";
import { convertInlineTypeDeclaration } from "../type-declarations/convertInlineTypeDeclaration";
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
        type: convertInlineTypeDeclaration({
            typeDeclarationOrShorthand: request,
            getTypeDeclaration: (request) => request.type,
            fernFilepath,
            imports,
        }),
    };
}
