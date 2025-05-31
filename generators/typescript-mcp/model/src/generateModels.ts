import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { AliasGenerator } from "./alias/AliasGenerator";
import { EndpointGenerator } from "./endpoint/EndpointGenerator";
import { EnumGenerator } from "./enum/EnumGenerator";
import { IndexGenerator } from "./index/IndexGenerator";
import { ObjectGenerator } from "./object/ObjectGenerator";
import { UndiscriminatedUnionGenerator } from "./union/UndiscriminatedUnionGenerator";
import { UnionGenerator } from "./union/UnionGenerator";

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
                file = new UndiscriminatedUnionGenerator(context, typeDeclaration, typeDeclaration.shape).generate();
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
    const services = Object.values(context.ir.services);
    for (const service of services) {
        const endpoints = Object.values(service.endpoints);
        for (const endpoint of endpoints) {
            try {
                const file = new EndpointGenerator(context, endpoint).generate();
                context.project.addSchemasFile(file);
            } catch (error) {
                // TODO:
            }
        }
    }
    const indexFile = new IndexGenerator(context, typeDeclarations, services).generate();
    context.project.addSchemasFile(indexFile);
}
