import { TypeName } from "@fern/ir-generation";
import path from "path";
import { Directory } from "ts-morph";

export function getFilePathForType({
    typeName,
    modelDirectory,
}: {
    modelDirectory: Directory;
    typeName: TypeName;
}): string {
    return `${path.join(modelDirectory.getPath(), typeName.fernFilepath, typeName.name)}.ts`;
}
