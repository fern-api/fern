import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { AbstractModelGenerator } from "./AbstractModelGenerator.js";
import { AliasGenerator } from "./alias/AliasGenerator.js";
import { EnumGenerator } from "./enum/EnumGenerator.js";
import { ModelGeneratorContext } from "./ModelGeneratorContext.js";
import { ObjectGenerator } from "./object/ObjectGenerator.js";
import { DiscriminatedUnionGenerator } from "./union/DiscriminatedUnionGenerator.js";
import { UndiscriminatedUnionGenerator } from "./union/UndiscriminatedUnionGenerator.js";

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
    typeDeclaration: FernIr.TypeDeclaration;
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
