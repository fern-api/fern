import { ModelGeneratorContext } from "../../ModelGeneratorContext";
import { ObjectGenerator } from "../../object";
import { createSampleGeneratorContext } from "./util/createSampleGeneratorContext";

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

describe("ObjectGenerator", () => {
    it("correctly generates nested enums for duplicate string literal values", async () => {
        const context = await createSampleGeneratorContext("duplicate-string-literals");
        const objectName = "ObjectWithDuplicateStringLiterals";
        const declaration = getObjectTypeDeclarationOrThrow(context, objectName);
        const generator = new ObjectGenerator({
            name: objectName,
            properties: declaration.properties,
            extendedProperties: declaration.extendedProperties,
            context
        });
        const struct = generator.generate();
        await expect(struct.toString()).toMatchFileSnapshot(`snapshots/${objectName}.swift`);
    });

    it(`ensures that the special 'CodingKeys' enum does not collide with other string literal enums`, async () => {
        const context = await createSampleGeneratorContext("coding-keys-literal");
        const objectName = "ObjectWithCodingKeysLiteral";
        const declaration = getObjectTypeDeclarationOrThrow(context, objectName);
        const generator = new ObjectGenerator({
            name: objectName,
            properties: declaration.properties,
            extendedProperties: declaration.extendedProperties,
            context
        });
        const object = generator.generate();
        await expect(object.toString()).toMatchFileSnapshot(`snapshots/${objectName}.swift`);
    });
});
