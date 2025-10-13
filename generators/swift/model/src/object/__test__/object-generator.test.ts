import { resolve } from "node:path";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { ModelGeneratorContext } from "../../ModelGeneratorContext";
import { ObjectGenerator } from "../../object";
import { createSampleGeneratorContext } from "../../test-utils/createSampleGeneratorContext";

function getObjectTypeDeclarationOrThrow(context: ModelGeneratorContext, name: string) {
    for (const declaration of Object.values(context.ir.types)) {
        const otd = declaration.shape._visit({
            object: (otd) => otd,
            alias: () => null,
            enum: () => null,
            undiscriminatedUnion: () => null,
            union: () => null,
            _other: () => null
        });
        if (otd && declaration.name.name.originalName === name) {
            return otd;
        }
    }
    throw new Error(`Type declaration for ${name} not found`);
}

function pathToDefinition(testDefinitionName: string) {
    return resolve(__dirname, "./test-definitions", testDefinitionName);
}

describe("ObjectGenerator", () => {
    it("correctly generates nested enums for duplicate string literal values", async () => {
        const context = await createSampleGeneratorContext(pathToDefinition("duplicate-string-literals"));
        const objectName = "ObjectWithDuplicateStringLiterals";
        const declaration = getObjectTypeDeclarationOrThrow(context, objectName);
        const generator = new ObjectGenerator({
            symbol: swift.Symbol.create(`MyCustomModule.ObjectWithDuplicateStringLiterals`, objectName, {
                type: "struct"
            }),
            properties: declaration.properties,
            extendedProperties: declaration.extendedProperties,
            context
        });
        const struct = generator.generate();
        await expect(struct.toString()).toMatchFileSnapshot(`snapshots/${objectName}.swift`);
    });

    it(`ensures that the special 'CodingKeys' enum does not collide with other string literal enums`, async () => {
        const context = await createSampleGeneratorContext(pathToDefinition("coding-keys-literal"));
        const objectName = "ObjectWithCodingKeysLiteral";
        const declaration = getObjectTypeDeclarationOrThrow(context, objectName);
        const generator = new ObjectGenerator({
            symbol: swift.Symbol.create(`MyCustomModule.ObjectWithCodingKeysLiteral`, objectName, {
                type: "struct"
            }),
            properties: declaration.properties,
            extendedProperties: declaration.extendedProperties,
            context
        });
        const object = generator.generate();
        await expect(object.toString()).toMatchFileSnapshot(`snapshots/${objectName}.swift`);
    });

    it(`correctly generates literals in container types`, async () => {
        const context = await createSampleGeneratorContext(pathToDefinition("literals-in-container-types"));
        const objectName = "ObjectWithLiteralsInContainerTypes";
        const declaration = getObjectTypeDeclarationOrThrow(context, objectName);
        const generator = new ObjectGenerator({
            symbol: swift.Symbol.create(`MyCustomModule.ObjectWithLiteralsInContainerTypes`, objectName, {
                type: "struct"
            }),
            properties: declaration.properties,
            extendedProperties: declaration.extendedProperties,
            context
        });
        const object = generator.generate();
        await expect(object.toString()).toMatchFileSnapshot(`snapshots/${objectName}.swift`);
    });

    it(`correctly handles name conflicts between nested types and schema types`, async () => {
        const context = await createSampleGeneratorContext(pathToDefinition("nested-type-collision-with-schema-type"));

        const fileComponents: swift.FileComponent[] = [];

        for (const declaration of Object.values(context.ir.types)) {
            declaration.shape._visit({
                object: (otd) => {
                    const generator = new ObjectGenerator({
                        symbol: swift.Symbol.create(
                            `MyCustomModule.ObjectWithNestedTypeCollisionWithSchemaType`,
                            declaration.name.name.pascalCase.unsafeName,
                            { type: "struct" }
                        ),
                        properties: otd.properties,
                        extendedProperties: otd.extendedProperties,
                        context
                    });
                    fileComponents.push(generator.generate());
                    fileComponents.push(swift.LineBreak.double());
                },
                alias: () => null,
                enum: () => null,
                undiscriminatedUnion: () => null,
                union: () => null,
                _other: () => null
            });
        }

        const fileContents = SwiftFile.getRawContents(fileComponents);

        await expect(fileContents).toMatchFileSnapshot(`snapshots/NestedTypeCollisionWithSchemaType.swift`);
    });
});
