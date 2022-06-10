import { FailedResponse, FernFilepath } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { DEFAULT_UNION_TYPE_DISCRIMINANT } from "../../constants";
import { createTypeReferenceParser } from "../../utils/parseInlineType";

export function convertFailedResponse({
    rawFailedResponse,
    fernFilepath,
    imports,
}: {
    rawFailedResponse: RawSchemas.FailedResponseSchema | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): FailedResponse {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });

    return {
        docs: rawFailedResponse?.docs,
        discriminant: rawFailedResponse?.discriminant ?? DEFAULT_UNION_TYPE_DISCRIMINANT,
        errors:
            rawFailedResponse?.errors == null
                ? []
                : Object.entries(rawFailedResponse.errors).map(([discriminantValue, errorReference]) => ({
                      docs: typeof errorReference !== "string" ? errorReference.docs : undefined,
                      discriminantValue,
                      error: parseTypeReference(
                          typeof errorReference === "string" ? errorReference : { type: errorReference.error }
                      ),
                  })),
    };
}
