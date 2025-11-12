import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";

import TestInput = TestClass.TestInput;

export declare namespace TestClass {
    interface TestInput {
        objectInstantiationSnippet: ast.CodeBlock;
        json: unknown;
    }
}

export class UnionSerializationTestGenerator extends FileGenerator<CSharpFile> {
    private classReference: ast.ClassReference;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly testInputs: TestInput[]
    ) {
        super(context);
        this.classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration);
    }

    protected doGenerate(): CSharpFile {
        const testClass = this.csharp.testClass({
            name: this.getTestClassName(),
            namespace: this.namespaces.test
        });
        this.testInputs.forEach((testInput, index) => {
            const testNumber = this.testInputs.length > 1 ? `_${index + 1}` : "";
            testClass.addTestMethod({
                name: `TestDeserialization${testNumber}`,
                body: this.csharp.codeblock((writer) => {
                    writer.writeLine("var json = ");
                    writer.writeTextStatement(this.convertToCSharpFriendlyJsonString(testInput.json));
                    writer.write("var expectedObject  = ");
                    writer.writeNodeStatement(testInput.objectInstantiationSnippet);
                    writer.write("var deserializedObject = ");
                    writer.writeNodeStatement(
                        this.csharp.invokeMethod({
                            on: this.Types.JsonUtils,
                            method: "Deserialize",
                            generics: [this.classReference],
                            arguments_: [this.csharp.codeblock("json")]
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
                body: this.csharp.codeblock((writer) => {
                    writer.writeLine("var expectedJson = ");
                    writer.writeTextStatement(this.convertToCSharpFriendlyJsonString(testInput.json));
                    writer.write("var actualObj  = ");
                    writer.writeNodeStatement(testInput.objectInstantiationSnippet);
                    writer.write("var actualElement = ");
                    writer.writeNodeStatement(
                        this.csharp.invokeMethod({
                            on: this.Types.JsonUtils,
                            method: "SerializeToElement",
                            arguments_: [this.csharp.codeblock("actualObj")]
                        })
                    );
                    writer.write("var expectedElement = ");
                    writer.writeNodeStatement(
                        this.csharp.invokeMethod({
                            on: this.Types.JsonUtils,
                            method: "Deserialize",
                            generics: [this.System.Text.Json.JsonElement],
                            arguments_: [this.csharp.codeblock("expectedJson")]
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
            directory: this.constants.folders.serializationTests,
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.constants.folders.testFiles,
            this.constants.folders.serializationTests,
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
