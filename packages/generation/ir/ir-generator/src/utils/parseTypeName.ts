import { RelativeFilePath } from "@fern-api/config-management-commons";
import { DeclaredTypeName, FernFilepath } from "@fern-fern/ir-model";
import path from "path";
import { convertToFernFilepath } from "./convertToFernFilepath";
import { parseReferenceToTypeName } from "./parseReferenceToTypeName";

export function parseTypeName({
    typeName,
    fernFilepath,
    imports,
}: {
    typeName: string;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): DeclaredTypeName {
    const reference = parseReferenceToTypeName({
        reference: typeName,
        referencedIn: fernFilepath.map((part) => part.originalValue).join(path.sep) as RelativeFilePath,
        imports,
    });
    if (reference == null) {
        throw new Error("Failed to locate type: " + typeName);
    }
    return {
        name: reference.typeName,
        fernFilepath:
            reference.relativeFilePath != null ? convertToFernFilepath(reference.relativeFilePath) : fernFilepath,
    };
}
