import { ErrorName } from "@fern-fern/ir-model";
import { getGeneratedErrorName } from "./getGeneratedErrorName";

export function getFileNameForError(errorName: ErrorName): string {
    return `${getGeneratedErrorName(errorName)}.ts`;
}
