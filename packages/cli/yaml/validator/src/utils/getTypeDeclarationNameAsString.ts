import { assertNever } from "@fern-api/core-utils";
import { TypeDeclarationName } from "@fern-api/yaml-schema";

export function getTypeDeclarationNameAsString(typeName: TypeDeclarationName): string {
    if (!typeName.isInlined) {
        return typeName.name;
    }
    switch (typeName.location) {
        case "inlinedRequest":
            return "<Inlined Request>";
        default:
            assertNever(typeName.location);
    }
}
