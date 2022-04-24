import { NamedType } from "@fern-api/api";
import path from "path";
import { Directory } from "ts-morph";

export function getFilePathForType({
    typeName,
    modelDirectory,
}: {
    modelDirectory: Directory;
    typeName: NamedType;
}): string {
    return `${path.join(modelDirectory.getPath(), typeName.fernFilepath, typeName.name)}.ts`;
}
