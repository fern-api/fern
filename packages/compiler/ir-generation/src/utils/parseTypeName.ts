import { FernFilepath, NamedType } from "@fern-api/api";
import { parseReference } from "./parseReference";

export function parseTypeName({
    typeName,
    fernFilepath,
    imports,
}: {
    typeName: string;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): NamedType {
    const reference = parseReference({
        reference: typeName,
        fernFilepath,
        imports,
    });
    return {
        name: reference.referenceName,
        fernFilepath,
    };
}
