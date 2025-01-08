import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
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

export class ObjectSerializationTestGenerator extends FileGenerator<
    CSharpFile,
    ModelCustomConfigSchema,
    ModelGeneratorContext
> {
    private classReference: csharp.ClassReference;
    private jsonSerializerClassReference: csharp.ClassReference = csharp.classReference({
        name: "JsonSerializer",
        namespace: "System.Text.Json"
    });

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
            const methodBody = csharp.codeblock((writer) => {
                writer.writeLine("var inputJson = ");
                writer.writeTextStatement(this.convertToCSharpFriendlyJsonString(testInput.json));
                writer.newLine();

                // todo: figure out what's broken with this object comparison
                // writer.write("var expectedObject  = ");
                // writer.writeNodeStatement(testInput.objectInstantiationSnippet);
                // writer.newLine();

                writer.write("var serializerOptions  = new ");
                writer.writeNode(
                    csharp.classReference({
                        name: "JsonSerializerOptions",
                        namespace: "System.Text.Json.Serialization"
                    })
                );
                writer.writeTextStatement(" { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull }");
                writer.writeLine();

                writer.write("var deserializedObject = ");
                writer.writeNodeStatement(
                    new csharp.MethodInvocation({
                        on: csharp.codeblock((writer) => writer.writeNode(this.jsonSerializerClassReference)),
                        method: "Deserialize",
                        generics: [csharp.Type.reference(this.classReference)],
                        arguments_: [csharp.codeblock("inputJson"), csharp.codeblock("serializerOptions")]
                    })
                );
                // todo: figure out what's broken with this object comparison
                // writer.writeTextStatement("Assert.That(expectedObject, Is.EqualTo(deserializedObject))");
                writer.newLine();
                writer.write("var serializedJson = ");
                writer.writeNodeStatement(
                    new csharp.MethodInvocation({
                        on: csharp.codeblock((writer) => writer.writeNode(this.jsonSerializerClassReference)),
                        method: "Serialize",
                        arguments_: [csharp.codeblock("deserializedObject"), csharp.codeblock("serializerOptions")]
                    })
                );
                writer.newLine();

                writer.addReference(this.context.getFluentAssetionsJsonClassReference());
                writer.writeNode(this.context.getJTokenClassReference());
                writer.write(".Parse(inputJson).Should().BeEquivalentTo(");
                writer.writeNode(this.context.getJTokenClassReference());
                writer.writeTextStatement(".Parse(serializedJson))");
            });
            const testNumber = this.testInputs.length > 1 ? `_${index + 1}` : "";
            testClass.addTestMethod({
                name: `TestSerialization${testNumber}`,
                body: methodBody,
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
        let jsonString = JSON.stringify(jsonObject, null, 2);

        // Escape double quotes for C# string
        jsonString = jsonString.replace(/"/g, '""');

        // Format it as a multi-line C# string
        return `@"
${jsonString}
"`;
    }
}
