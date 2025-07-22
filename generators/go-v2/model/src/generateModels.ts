import { assertNever } from "@fern-api/core-utils";
import { ModelGeneratorContext } from "./ModelGeneratorContext";

export function generateModels(context: ModelGeneratorContext): void {
    for (const typeDeclaration of Object.values(context.ir.types)) {
        switch (typeDeclaration.shape.type) {
            case "alias":
            case "enum":
            case "object":
            case "union":
            case "undiscriminatedUnion":
                break;
            default:
                assertNever(typeDeclaration.shape);
        }
    }
}
