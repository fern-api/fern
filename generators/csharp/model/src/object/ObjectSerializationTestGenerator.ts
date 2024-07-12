import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ClassReference, CodeBlock } from "@fern-api/csharp-codegen/lib/ast";
import TestInput = TestClass.TestInput;

export declare namespace TestClass {
    interface TestInput {
        objectInstantiationSnippet: csharp.CodeBlock;
        json: unknown;
    }
}

export class ObjectSerializationTestGenerator extends FileGenerator<
    CSharpFile,
    ModelCustomConfigSchema,
    ModelGeneratorContext
> {
    private readonly testName: string;
    private readonly objectUnderTestName;

    constructor(
        context: ModelGeneratorContext,
        private readonly objectUnderTestClassReference: ClassReference,
        private readonly testInputs: TestInput[]
    ) {
        super(context);
        this.objectUnderTestName = objectUnderTestClassReference.name;
        this.testName = `${this.objectUnderTestName}SerializationTests`;
    }

    protected doGenerate(): CSharpFile {
        const testClass = csharp.testClass({
            name: this.testName,
            namespace: this.context.getTestNamespace()
        });
        this.testInputs.forEach((testInput, index) => {
            const methodBody = csharp.codeblock((writer) => {
                // this.context.logger.info("JSON STRING: ");
                // this.context.logger.info(typeof testInput.json);
                // this.context.logger.info(testInput.json as string);
                writer.writeLine("var inputJson = ");
                writer.writeTextStatement(this.convertToCSharpFriendlyJsonString(testInput.json));
                writer.newLine();

                writer.write("var expectedObject  = ");
                writer.writeNodeStatement(testInput.objectInstantiationSnippet);
                writer.newLine();

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
                writer.writeNode(
                    csharp.classReference({
                        name: "JsonSerializer",
                        namespace: "System.Text.Json"
                    })
                );
                writer.write(".Deserialize<");
                writer.writeNode(this.objectUnderTestClassReference);
                writer.writeTextStatement(">(inputJson, serializerOptions)");
                writer.writeTextStatement("Assert.That(expectedObject, Is.EqualTo(deserializedObject))");
                writer.newLine();

                writer.writeTextStatement(
                    "var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions)"
                );
                writer.write("Assert.That(");
                const jTokenClassReference = csharp.classReference({
                    name: "JToken",
                    namespace: "Newtonsoft.Json.Linq"
                });
                writer.writeNode(jTokenClassReference);
                writer.write(".DeepEquals(");
                writer.writeNode(jTokenClassReference);
                writer.write(".Parse(inputJson), ");
                writer.writeNode(jTokenClassReference);
                writer.writeTextStatement(".Parse(serializedJson)))");
            });
            const testNumber = this.testInputs.length > 1 ? `_${index + 1}` : "";
            testClass.addTestMethod({
                name: `${this.objectUnderTestName}SerializationTest${testNumber}`,
                body: methodBody
            });
        });
        return new CSharpFile({
            clazz: testClass.getClass(),
            directory: RelativeFilePath.of("Unit/Model/")
        });
    }
    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getTestFilesDirectory(),
            RelativeFilePath.of(`Unit/Model/${this.testName}.cs`)
        );
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
