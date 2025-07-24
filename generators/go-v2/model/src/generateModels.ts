import { assertNever } from "@fern-api/core-utils";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { EnumGenerator } from "./enum/EnumGenerator";

export function generateModels(context: ModelGeneratorContext): void {
    for (const typeDeclaration of Object.values(context.ir.types)) {
        switch (typeDeclaration.shape.type) {
            case "enum": {
                const enumGenerator = new EnumGenerator(context, typeDeclaration, typeDeclaration.shape);
                context.project.addGoFiles(enumGenerator.generate());
                break;
            }
            case "alias":
            case "object":
            case "union":
            case "undiscriminatedUnion":
                break;
            default:
                assertNever(typeDeclaration.shape);
        }
    }
}
