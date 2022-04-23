import { FernFilepath, ResponseErrors } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { DEFAULT_UNION_TYPE_DISCRIMINANT } from "../../constants";
import { parseTypeName } from "../../utils/parseTypeName";

export function convertResponseErrors({
    rawResponseErrors,
    fernFilepath,
    imports,
}: {
    rawResponseErrors: RawSchemas.ResponseErrorsSchema | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): ResponseErrors {
    return {
        docs: rawResponseErrors?.docs,
        discriminant: rawResponseErrors?.discriminant ?? DEFAULT_UNION_TYPE_DISCRIMINANT,
        possibleErrors:
            rawResponseErrors?.union == null
                ? []
                : Object.entries(rawResponseErrors.union).map(([discriminantValue, errorReference]) => ({
                      docs: typeof errorReference !== "string" ? errorReference.docs : undefined,
                      discriminantValue,
                      error: parseTypeName({
                          typeName: typeof errorReference === "string" ? errorReference : errorReference.error,
                          fernFilepath,
                          imports,
                      }),
                  })),
    };
}
