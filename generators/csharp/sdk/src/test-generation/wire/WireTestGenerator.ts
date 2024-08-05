import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ExampleEndpointCall, HttpEndpoint, Name, ServiceId } from "@fern-fern/ir-sdk/api";
import { EndpointGenerator } from "../../endpoint/EndpointGenerator";
import { SdkCustomConfigSchema } from "../../SdkCustomConfig";
import { SdkGeneratorContext, WIRE_TEST_FOLDER } from "../../SdkGeneratorContext";

export declare namespace TestClass {
    interface TestInput {
        objectInstantiationSnippet: csharp.CodeBlock;
        json: unknown;
    }
}

export class WireTestGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private classReference: csharp.ClassReference;
    private readonly endpointGenerator: EndpointGenerator;

    constructor(
        context: SdkGeneratorContext,
        private readonly exampleEndpointCalls: ExampleEndpointCall[],
        private readonly endpoint: HttpEndpoint,
        private readonly serviceId: ServiceId,
        private readonly subclientName?: Name
    ) {
        super(context);
        this.classReference = csharp.classReference({
            name: this.endpoint.name.pascalCase.safeName,
            namespace: this.context.getWireTestNamespace()
        });
        this.endpointGenerator = new EndpointGenerator(context);
    }

    protected doGenerate(): CSharpFile {
        const testClass = csharp.testClass({
            name: this.getTestClassName(),
            namespace: this.context.getTestNamespace(),
            parentClassReference: this.context.getBaseWireTestClassReference()
        });
        this.exampleEndpointCalls.forEach((testInput, index) => {
            const methodBody = csharp.codeblock((writer) => {
                if (testInput.request != null) {
                    writer.writeLine('const string requestJson = """');
                    writer.writeLine(JSON.stringify(testInput.request.jsonExample, null, 2), true);
                    writer.writeTextStatement('"""');
                }
                writer.newLine();
                if (testInput.response != null) {
                    if (testInput.response.type !== "ok" || testInput.response.value.type !== "body") {
                        throw new Error("Unexpected error response type");
                    }
                    const jsonExampleResponse = testInput.response.value.value?.jsonExample;
                    if (jsonExampleResponse != null) {
                        writer.writeLine('const string mockResponse = """');
                        writer.writeLine(JSON.stringify(jsonExampleResponse, null, 2));
                        writer.writeTextStatement('"""');
                    }
                }
                writer.newLine();

                writer.write("Server.Given(WireMock.RequestBuilders.Request.Create()");
                writer.write(`.WithPath("${this.endpoint.fullPath}/${testInput.url}")`);
                writer.write(
                    `.Using${
                        this.endpoint.method.charAt(0).toUpperCase() + this.endpoint.method.slice(1).toLowerCase()
                    }()`
                );
                if (testInput.request != null) {
                    writer.write(".WithBody(requestJson)");
                }
                writer.writeLine(")");
                writer.newLine();

                if (testInput.response != null) {
                    writer.writeLine(".RespondWith(WireMock.ResponseBuilders.Response.Create()");
                    writer.writeLine(".WithStatusCode(200)");
                    writer.writeTextStatement(".WithBody(mockResponse))");
                } else {
                    writer.writeLine(";");
                }

                const endpointSnippet = this.endpointGenerator.generateEndpointSnippet(
                    testInput,
                    this.endpoint,
                    "Client",
                    this.serviceId,
                    this.subclientName
                );
                if (endpointSnippet == null) {
                    throw new Error("Endpoint snippet is null");
                }
                writer.write("var response = ");
                writer.writeNode(endpointSnippet);
                writer.writeTextStatement(".Result");
                writer.newLine();

                writer.writeNode(
                    csharp.classReference({
                        name: "JsonDiffChecker",
                        namespace: this.context.getTestUtilsNamespace()
                    })
                );
                writer.write(".AssertJsonEquals(mockResponse, ");
                writer.writeNode(this.context.getJsonUtilsClassReference());
                writer.writeTextStatement(".Serialize(response))");
            });
            const testNumber = this.exampleEndpointCalls.length > 1 ? `_${index + 1}` : "";
            testClass.addTestMethod({
                name: `WireTest${testNumber}`,
                body: methodBody
            });
        });
        return new CSharpFile({
            clazz: testClass.getClass(),
            directory: WIRE_TEST_FOLDER
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getTestFilesDirectory(),
            WIRE_TEST_FOLDER,
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
