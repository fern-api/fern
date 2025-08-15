import { assertNever } from "@fern-api/core-utils";
import { TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { AbstractModelGenerator } from "./AbstractModelGenerator";
import { AliasGenerator } from "./alias/AliasGenerator";
import { EnumGenerator } from "./enum/EnumGenerator";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { ObjectGenerator } from "./object/ObjectGenerator";
import { DiscriminatedUnionGenerator } from "./union/DiscriminatedUnionGenerator";
import { UndiscriminatedUnionGenerator } from "./union/UndiscriminatedUnionGenerator";

export function generateModels(context: ModelGeneratorContext): void {
    for (const typeDeclaration of Object.values(context.ir.types)) {
        const generator = buildModelGenerator({ context, typeDeclaration });
        context.project.addGoFiles(generator.generate());
    }
}

function buildModelGenerator({
    context,
    typeDeclaration
}: {
    context: ModelGeneratorContext;
    typeDeclaration: TypeDeclaration;
}): AbstractModelGenerator {
    switch (typeDeclaration.shape.type) {
        case "alias":
            return new AliasGenerator(context, typeDeclaration, typeDeclaration.shape);
        case "enum":
            return new EnumGenerator(context, typeDeclaration, typeDeclaration.shape);
        case "object":
            return new ObjectGenerator(context, typeDeclaration, typeDeclaration.shape);
        case "union":
            return new DiscriminatedUnionGenerator(context, typeDeclaration, typeDeclaration.shape);
        case "undiscriminatedUnion":
            return new UndiscriminatedUnionGenerator(context, typeDeclaration, typeDeclaration.shape);
        default:
            assertNever(typeDeclaration.shape);
    }
}
