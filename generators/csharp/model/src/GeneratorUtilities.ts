import { Name } from "@fern-fern/ir-sdk/api";

// Field and Class names follow pascal case, so just make a utility
export function getNameFromIrName(name: Name): string {
    return name.pascalCase.safeName;
}
