import { CSharpFile } from "@fern-api/csharp-codegen";
import { EnumTypeDeclaration, ObjectTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { EnumGenerator } from "./enum/EnumGenerator";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { ObjectGenerator } from "./object/ObjectGenerator";
import { ObjectSerializationTestGenerator } from "./object/ObjectSerializationTestGenerator";

export function generateModels({ context }: { context: ModelGeneratorContext }): CSharpFile[] {
    const files: CSharpFile[] = [];
    for (const [_, typeDeclaration] of Object.entries(context.ir.types)) {
        const file = typeDeclaration.shape._visit<CSharpFile | undefined>({
            alias: () => undefined,
            enum: (etd: EnumTypeDeclaration) => {
                return new EnumGenerator(context, typeDeclaration, etd).generate();
            },
            object: (otd: ObjectTypeDeclaration) => {
                const objectGenerator = new ObjectGenerator(context, typeDeclaration, otd);
                const generatedObjectCSharpFile = objectGenerator.generate();
                if (typeDeclaration.userProvidedExamples.length === 0) {
                    return generatedObjectCSharpFile;
                }
                const testInputs = typeDeclaration.userProvidedExamples.map((example) => {
                    const exampleObjectType = example.shape._visit({
                        alias: () => undefined,
                        enum: () => undefined,
                        object: (exampleObjectType) => exampleObjectType,
                        union: () => undefined,
                        undiscriminatedUnion: () => undefined,
                        _other: () => undefined
                    });
                    if (exampleObjectType == null) {
                        throw new Error("Unexpected non object type example");
                    }
                    const snippet = objectGenerator.doGenerateSnippet(exampleObjectType);
                    return {
                        objectInstantiationSnippet: snippet,
                        json: example.jsonExample
                    };
                });
                const testGenerator = new ObjectSerializationTestGenerator(context, typeDeclaration, testInputs);
                context.project.addTestFiles(testGenerator.generate());
                return generatedObjectCSharpFile;
            },
            undiscriminatedUnion: () => undefined,
            union: () => undefined,
            _other: () => undefined
        });
        if (file != null) {
            files.push(file);
        }
    }
    return files;
}
