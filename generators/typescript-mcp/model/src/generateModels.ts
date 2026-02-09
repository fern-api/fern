import { AliasGenerator } from "./alias/AliasGenerator.js";
import { EnumGenerator } from "./enum/EnumGenerator.js";
import { IndexGenerator } from "./index/IndexGenerator.js";
import { ModelGeneratorContext } from "./ModelGeneratorContext.js";
import { ObjectGenerator } from "./object/ObjectGenerator.js";
import { UnionGenerator } from "./union/UnionGenerator.js";

export function generateModels(context: ModelGeneratorContext): void {
    const typeDeclarations = Object.values(context.ir.types);
    for (const typeDeclaration of typeDeclarations) {
        let file;
        switch (typeDeclaration.shape.type) {
            case "alias":
                file = new AliasGenerator(context, typeDeclaration, typeDeclaration.shape).generate();
                break;
            case "enum":
                file = new EnumGenerator(context, typeDeclaration, typeDeclaration.shape).generate();
                break;
            case "object":
                file = new ObjectGenerator(context, typeDeclaration, typeDeclaration.shape).generate();
                break;
            case "undiscriminatedUnion":
                break;
            case "union":
                file = new UnionGenerator(context, typeDeclaration, typeDeclaration.shape).generate();
                break;
            default:
                break;
        }
        if (file != null) {
            context.project.addSchemasFile(file);
        }
    }
    const indexFile = new IndexGenerator(context, typeDeclarations).generate();
    context.project.addSchemasFile(indexFile);
}
