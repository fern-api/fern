import { FernFilepath, NamedError } from "@fern-api/api";
import { parseReference } from "./parseReference";

export function parseError({
    errorName,
    fernFilepath,
    imports,
}: {
    errorName: string;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): NamedError {
    const reference = parseReference({
        reference: errorName,
        fernFilepath,
        imports,
    });
    return {
        name: reference.referenceName,
        fernFilepath: reference.fernFilepath,
    };
}
