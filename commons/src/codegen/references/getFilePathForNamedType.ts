import { NamedType } from "@fern-api/api";
import path from "path";
import { Directory } from "ts-morph";

export function getFilePathForNamedType({
    typeName,
    baseDirectory,
}: {
    /**
     * the directory where the original type lives.
     * for types, this should be the model directory.
     * for errors, this should be the errors directory.
     */
    baseDirectory: Directory;
    typeName: NamedType;
}): string {
    return `${path.join(baseDirectory.getPath(), typeName.fernFilepath, typeName.name)}.ts`;
}
