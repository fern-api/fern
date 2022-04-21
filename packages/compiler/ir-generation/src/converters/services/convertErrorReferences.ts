import { ErrorReference, FernFilepath } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { getDocs } from "../../utils/getDocs";
import { parseError } from "../../utils/parseError";

export function convertErrorReferences({
    errors,
    fernFilepath,
    imports,
}: {
    errors: Record<string, RawSchemas.ErrorReferenceSchema> | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): ErrorReference[] {
    if (errors == null) {
        return [];
    }

    return Object.entries(errors).map(([discriminantValue, error]) => {
        return {
            docs: getDocs(error),
            discriminantValue,
            error: parseError({
                errorName: typeof error === "string" ? error : error.error,
                fernFilepath,
                imports,
            }),
        };
    });
}
