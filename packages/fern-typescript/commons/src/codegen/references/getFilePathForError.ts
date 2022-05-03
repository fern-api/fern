import { NamedType } from "@fern-api/api";
import path from "path";
import { Directory } from "ts-morph";

export function getFilePathForError({
    error,
    errorsDirectory,
}: {
    errorsDirectory: Directory;
    error: NamedType;
}): string {
    return `${path.join(errorsDirectory.getPath(), error.fernFilepath, error.name)}.ts`;
}
