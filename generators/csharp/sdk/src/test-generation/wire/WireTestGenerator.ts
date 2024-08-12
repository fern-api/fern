import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ExampleEndpointCall, FernFilepath, HttpEndpoint, ServiceId } from "@fern-fern/ir-sdk/api";
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
        private readonly serviceFilePath: FernFilepath
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
        this.exampleEndpointCalls.forEach((example, index) => {
            const methodBody = csharp.codeblock((writer) => {
                if (example.request != null) {
                    writer.writeLine('const string requestJson = """');
                    writer.writeLine(JSON.stringify(example.request.jsonExample, null, 2), true);
                    writer.writeTextStatement('"""');
                }
                writer.newLine();
                let hasJsonExampleResponse = false;
                if (example.response != null) {
                    if (example.response.type !== "ok" || example.response.value.type !== "body") {
                        throw new Error("Unexpected error response type");
                    }
                    const jsonExampleResponse = example.response.value.value?.jsonExample;
                    if (jsonExampleResponse != null) {
                        hasJsonExampleResponse = true;
                        writer.writeLine('const string mockResponse = """');
                        writer.writeLine(JSON.stringify(jsonExampleResponse, null, 2));
                        writer.writeTextStatement('"""');
                    }
                }
                writer.newLine();

                writer.write("Server.Given(WireMock.RequestBuilders.Request.Create()");
                writer.write(`.WithPath("${example.url || "/"}")`);

                // TODO: include examples that aren't strings, need to figure out encoding etc.
                for (const parameter of example.queryParameters) {
                    if (typeof parameter.value.jsonExample === "string") {
                        writer.write(`.WithParam("${parameter.name.wireValue}", "${parameter.value.jsonExample}")`);
                    }
                }
                for (const header of [...example.serviceHeaders, ...example.endpointHeaders]) {
                    if (typeof header.value.jsonExample === "string") {
                        writer.write(`.WithHeader("${header.name.wireValue}", "${header.value.jsonExample}")`);
                    }
                }
                writer.write(
                    `.Using${
                        this.endpoint.method.charAt(0).toUpperCase() + this.endpoint.method.slice(1).toLowerCase()
                    }()`
                );
                if (example.request != null) {
                    writer.write(".WithBody(requestJson)");
                }
                writer.writeLine(")");
                writer.newLine();
                writer.writeLine(".RespondWith(WireMock.ResponseBuilders.Response.Create()");
                writer.writeLine(".WithStatusCode(200)");
                if (hasJsonExampleResponse) {
                    writer.writeTextStatement(".WithBody(mockResponse))");
                } else {
                    writer.writeTextStatement(")");
                }
                writer.newLine();

                const endpointSnippet = this.endpointGenerator.generateEndpointSnippet({
                    example,
                    endpoint: this.endpoint,
                    clientVariableName: "Client",
                    serviceId: this.serviceId,
                    serviceFilePath: this.serviceFilePath,
                    getResult: true
                });
                if (endpointSnippet == null) {
                    throw new Error("Endpoint snippet is null");
                }
                if (hasJsonExampleResponse) {
                    writer.write("var response = ");
                } else {
                    writer.write("Assert.DoesNotThrow(() => ");
                }
                writer.writeNode(endpointSnippet);
                if (!hasJsonExampleResponse) {
                    writer.write(")");
                }
                writer.write(";");

                if (hasJsonExampleResponse) {
                    writer.newLine();

                    writer.addReference(this.context.getFluentAssetionsJsonClassReference());
                    writer.writeNode(this.context.getJTokenClassReference());
                    writer.write(".Parse(serializedJson).Should().BeEquivalentTo(");
                    writer.writeNode(this.context.getJTokenClassReference());
                        writer.writeTextStatement(".Parse(response))");
                }
            });
            const testNumber = this.exampleEndpointCalls.length > 1 ? `_${index + 1}` : "";
            testClass.addTestMethod({
                name: `WireTest${testNumber}`,
                body: methodBody
            });
        });
        return new CSharpFile({
            clazz: testClass.getClass(),
            directory: WIRE_TEST_FOLDER,
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
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
}
