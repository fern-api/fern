import { DeclaredErrorName } from "@fern-fern/ir-model/errors";

export function getGeneratedErrorName(errorName: DeclaredErrorName): string {
    return errorName.name;
}
