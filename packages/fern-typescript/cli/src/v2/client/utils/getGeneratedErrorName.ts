import { ErrorName } from "@fern-fern/ir-model";

export function getGeneratedErrorName(errorName: ErrorName): string {
    return errorName.name;
}
