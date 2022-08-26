import { RelativeFilePath } from "@fern-api/core-utils";
import { FernFilepath } from "@fern-fern/ir-model/commons";
import { DeclaredTypeName } from "@fern-fern/ir-model/types";
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
    imports: Record<string, RelativeFilePath>;
}): DeclaredTypeName {
    const reference = parseReferenceToTypeName({
        reference: typeName,
        referencedIn: RelativeFilePath.of(fernFilepath.map((part) => part.originalValue).join(path.sep)),
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
