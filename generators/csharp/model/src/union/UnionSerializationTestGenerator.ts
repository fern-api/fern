import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

import TestInput = TestClass.TestInput;

export declare namespace TestClass {
    interface TestInput {
        objectInstantiationSnippet: csharp.CodeBlock;
        json: unknown;
    }
}

const SERIALIZATION_TEST_FOLDER = RelativeFilePath.of("Unit/Serialization");

export class UnionSerializationTestGenerator extends FileGenerator<
    CSharpFile,
    ModelCustomConfigSchema,
    ModelGeneratorContext
> {
    private classReference: csharp.ClassReference;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly testInputs: TestInput[]
    ) {
        super(context);
        this.classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration.name);
    }

    protected doGenerate(): CSharpFile {
        const testClass = csharp.testClass({
            name: this.getTestClassName(),
            namespace: this.context.getTestNamespace()
        });
        this.testInputs.forEach((testInput, index) => {
            const testNumber = this.testInputs.length > 1 ? `_${index + 1}` : "";
            testClass.addTestMethod({
                name: `TestDeserialization${testNumber}`,
                body: csharp.codeblock((writer) => {
                    writer.writeLine("var json = ");
                    writer.writeTextStatement(this.convertToCSharpFriendlyJsonString(testInput.json));
                    writer.write("var expectedObject  = ");
                    writer.writeNodeStatement(testInput.objectInstantiationSnippet);
                    writer.write("var deserializedObject = ");
                    writer.writeNodeStatement(
                        csharp.invokeMethod({
                            on: this.context.getJsonUtilsClassReference(),
                            method: "Deserialize",
                            generics: [csharp.Type.reference(this.classReference)],
                            arguments_: [csharp.codeblock("json")]
                        })
                    );
                    writer.writeTextStatement(
                        "Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults())"
                    );
                }),
                isAsync: false
            });

            testClass.addTestMethod({
                name: `TestSerialization${testNumber}`,
                body: csharp.codeblock((writer) => {
                    writer.writeLine("var expectedJson = ");
                    writer.writeTextStatement(this.convertToCSharpFriendlyJsonString(testInput.json));
                    writer.write("var actualObj  = ");
                    writer.writeNodeStatement(testInput.objectInstantiationSnippet);
                    writer.write("var actualElement = ");
                    writer.writeNodeStatement(
                        csharp.invokeMethod({
                            on: this.context.getJsonUtilsClassReference(),
                            method: "SerializeToElement",
                            arguments_: [csharp.codeblock("actualObj")]
                        })
                    );
                    writer.write("var expectedElement = ");
                    writer.writeNodeStatement(
                        csharp.invokeMethod({
                            on: this.context.getJsonUtilsClassReference(),
                            method: "Deserialize",
                            generics: [csharp.Type.reference(this.context.getJsonElementClassReference())],
                            arguments_: [csharp.codeblock("expectedJson")]
                        })
                    );
                    writer.writeTextStatement(
                        "Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer())"
                    );
                }),
                isAsync: false
            });
        });
        return new CSharpFile({
            clazz: testClass.getClass(),
            directory: SERIALIZATION_TEST_FOLDER,
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getTestFilesDirectory(),
            SERIALIZATION_TEST_FOLDER,
            RelativeFilePath.of(`${this.getTestClassName()}.cs`)
        );
    }

    private getTestClassName(): string {
        return `${this.classReference.name}Test`;
    }

    private convertToCSharpFriendlyJsonString(jsonObject: unknown): string {
        // Convert object to JSON string with indentation
        const jsonString = JSON.stringify(jsonObject, null, 2);

        // Format it as a multi-line C# string
        return `"""
${jsonString}
"""`;
    }
}
