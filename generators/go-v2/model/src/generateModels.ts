import { assertNever } from "@fern-api/core-utils";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { EnumGenerator } from "./enum/EnumGenerator";
import { ObjectGenerator } from "./object/ObjectGenerator";
import { AliasGenerator } from "./alias/AliasGenerator";
import { TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { AbstractModelGenerator } from "./AbstractModelGenerator";

export function generateModels(context: ModelGeneratorContext): void {
    for (const typeDeclaration of Object.values(context.ir.types)) {
        const generator = buildModelGenerator({ context, typeDeclaration });
        if (generator != null) {
            context.project.addGoFiles(generator.generate());
        }
    }
}

function buildModelGenerator({
    context,
    typeDeclaration
}: {
    context: ModelGeneratorContext;
    typeDeclaration: TypeDeclaration;
}): AbstractModelGenerator | undefined {
    switch (typeDeclaration.shape.type) {
        case "alias":
            return new AliasGenerator(context, typeDeclaration, typeDeclaration.shape);
        case "enum":
            return new EnumGenerator(context, typeDeclaration, typeDeclaration.shape);
        case "object":
            return new ObjectGenerator(context, typeDeclaration, typeDeclaration.shape);
        case "union":
        case "undiscriminatedUnion":
            return undefined;
        default:
            assertNever(typeDeclaration.shape);
    }
}
