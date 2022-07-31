import { ErrorName } from "@fern-fern/ir-model";
import path from "path";
import { getFileNameForError } from "./getFileNameForError";
import { getFilepathForFernFilepath } from "./getFilepathForFernFilepath";

export function getFilepathForError(errorName: ErrorName): string {
    return path.join(getFilepathForFernFilepath(errorName.fernFilepath), getFileNameForError(errorName));
}
