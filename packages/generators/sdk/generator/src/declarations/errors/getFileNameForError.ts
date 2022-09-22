import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { getGeneratedErrorName } from "./getGeneratedErrorName";

export function getFileNameForError(errorName: DeclaredErrorName): string {
    return `${getGeneratedErrorName(errorName)}.ts`;
}
