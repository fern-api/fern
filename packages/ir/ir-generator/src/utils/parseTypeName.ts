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
        relativeFilePathOfDirectory: fernFilepath.join(path.sep),
        imports,
    });
    return {
        name: reference.referenceName,
        fernFilepath:
            reference.relativeFilePath != null ? convertToFernFilepath(reference.relativeFilePath) : fernFilepath,
    };
}
