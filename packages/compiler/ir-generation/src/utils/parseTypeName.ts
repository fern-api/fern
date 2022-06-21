import { FernFilepath, TypeName } from "@fern-api/api";
import { parseReference } from "./parseReference";

export function parseTypeName({
    typeName,
    fernFilepath,
    imports,
}: {
    typeName: string;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): TypeName {
    const reference = parseReference({
        reference: typeName,
        fernFilepath,
        imports,
    });
    return {
        name: reference.referenceName,
        fernFilepath: reference.fernFilepath,
    };
}
