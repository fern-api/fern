import { CSharpFile, FileGenerator, GrpcClientInfo } from "@fern-api/csharp-base";
import { ast, Writer } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

type ExampleEndpointCall = FernIr.ExampleEndpointCall;
type HttpEndpoint = FernIr.HttpEndpoint;
type ServiceId = FernIr.ServiceId;

import { GrpcEndpointGenerator } from "../../endpoint/grpc/GrpcEndpointGenerator.js";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { GrpcStubGenerator } from "./GrpcStubGenerator.js";

/**
 * Generates a test fixture class for a single gRPC endpoint.
 * Each test method:
 *   1. Creates a fresh stub and configures it with `.OnMethodName(handler)`
 *   2. Builds an in-process gRPC mock server via GrpcMockServerBuilder
 *   3. Instantiates the generated SDK client with the mock channel
 *   4. Calls the endpoint and asserts the response
 */
export class GrpcMockServerTestGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private readonly classReference: ast.ClassReference;
    private readonly grpcEndpointGenerator: GrpcEndpointGenerator;
    private readonly grpcClientInfo: GrpcClientInfo;
    private readonly stubGenerator: GrpcStubGenerator;

    constructor(
        context: SdkGeneratorContext,
        private readonly exampleEndpointCalls: ExampleEndpointCall[],
        private readonly endpoint: HttpEndpoint,
        private readonly serviceId: ServiceId,
        grpcClientInfo: GrpcClientInfo,
        stubGenerator: GrpcStubGenerator
    ) {
        super(context);

        this.grpcClientInfo = grpcClientInfo;
        this.stubGenerator = stubGenerator;

        this.classReference = this.csharp.classReference({
            origin: this.model.explicit(this.endpoint, `Test${this.getTestNamespace()}`),
            name: `${this.endpoint.name.pascalCase.safeName}Test`,
            namespace: this.getTestNamespace()
        });

        this.grpcEndpointGenerator = new GrpcEndpointGenerator({ context });
    }

    private getServiceNamespaceSegments(): string[] {
        const subpackage = this.context.getSubpackageForServiceId(this.serviceId);
        if (!subpackage) {
            return [];
        }
        return subpackage.fernFilepath.allParts.map((part) => part.pascalCase.safeName);
    }

    private getTestNamespace(): string {
        const segments = this.getServiceNamespaceSegments();
        if (segments.length === 0) {
            return this.namespaces.mockServerTest;
        }
        return [this.namespaces.mockServerTest, ...segments].join(".");
    }

    protected doGenerate(): CSharpFile {
        const testClass = this.csharp.testClass({
            name: this.classReference.name,
            namespace: this.getTestNamespace(),
            origin: this.classReference.origin
        });
        this.exampleEndpointCalls.forEach((example, index) => {
            let jsonExampleResponse: unknown | undefined = undefined;
            if (example.response != null) {
                if (example.response.type !== "ok" || example.response.value.type !== "body") {
                    throw new Error("Unexpected error response type");
                }
                jsonExampleResponse = example.response.value.value?.jsonExample;
            }
            const responseBodyType = this.endpoint.response?.body?.type;
            const isSupportedResponse =
                jsonExampleResponse != null && (responseBodyType === "json" || responseBodyType === "text");

            // Pre-generate the endpoint snippet to check for unsupported patterns
            const endpointSnippet = this.grpcEndpointGenerator.generateGrpcEndpointSnippet({
                example,
                endpoint: this.endpoint,
                clientVariableName: "client",
                serviceId: this.serviceId,
                parseDatetimes: true,
                getResult: true
            });
            if (endpointSnippet == null) {
                return;
            }

            // Render the snippet to check for patterns that won't compile
            const snippetCode = endpointSnippet.toString({
                namespace: this.getTestNamespace(),
                allNamespaceSegments: this.context.getAllNamespaceSegments(),
                allTypeClassReferences: this.context.getAllTypeClassReferences(),
                generation: this.generation,
                skipImports: true
            });
            if (hasUnsupportedSnippetPattern(snippetCode)) {
                return;
            }

            const methodBody = this.csharp.codeblock((writer: Writer) => {
                this.writeGrpcMockServerTestBody({
                    writer,
                    endpointSnippet,
                    jsonExampleResponse,
                    isSupportedResponse
                });
            });
            const testNumber = this.exampleEndpointCalls.length > 1 ? `_${index + 1}` : "";
            testClass.addTestMethod({
                name: `MockServerTest${testNumber}`,
                body: methodBody,
                isAsync: true
            });
        });
        return new CSharpFile({
            clazz: testClass.getClass(),
            directory: this.getDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    private writeGrpcMockServerTestBody({
        writer,
        endpointSnippet,
        jsonExampleResponse,
        isSupportedResponse
    }: {
        writer: Writer;
        endpointSnippet: ast.MethodInvocation;
        jsonExampleResponse: unknown | undefined;
        isSupportedResponse: boolean;
    }): void {
        const returnTypeName = this.getReturnTypeName();
        const canAssertResponse = isSupportedResponse && returnTypeName != null;

        // Write the mock response JSON only when we can fully round-trip it
        if (canAssertResponse && jsonExampleResponse != null) {
            const responseBodyType = this.endpoint.response?.body?.type;
            if (responseBodyType === "json") {
                writer.writeLine('const string mockResponse = """');
                writer.writeLine(JSON.stringify(jsonExampleResponse, null, 2).replace(/"\\{1,2}\$ref"/g, '"$ref\\"'));
                writer.writeTextStatement('"""');
            } else if (responseBodyType === "text") {
                writer.writeTextStatement(`const string mockResponse = "${jsonExampleResponse as string}"`);
            }
            writer.newLine();
        }

        // Add using for JsonUtils (needed for Deserialize in stub handler)
        writer.addNamespace(`${this.namespaces.root}.Core`);

        const stubClassName = this.stubGenerator.getStubClassName();
        const serviceBaseClassName = this.stubGenerator.getServiceBaseClassName();

        // Instantiate and configure the stub
        writer.write(`var stub = new ${stubClassName}()`);
        writer.newLine();

        const methodName = this.endpoint.name.pascalCase.safeName;
        const protoResponseType = this.stubGenerator.getProtoResponseType(this.endpoint);
        if (canAssertResponse) {
            writer.writeLine(`    .On${methodName}((request) =>`);
            writer.writeLine("    {");
            writer.writeLine(`        var mockObject = JsonUtils.Deserialize<${returnTypeName}>(mockResponse);`);
            writer.writeLine("        return mockObject.ToProto();");
            writer.writeTextStatement("    })");
        } else {
            writer.writeTextStatement(`    .On${methodName}((request) => new ${protoResponseType}())`);
        }
        writer.newLine();

        // Build the mock server using GrpcMockServerBuilder
        writer.writeLine("await using var mock = await GrpcMockServerBuilder.Configure()");
        writer.writeLine(`    .WithService<${serviceBaseClassName}>(stub)`);
        writer.writeTextStatement("    .BuildAsync()");
        writer.newLine();

        // Instantiate the generated client with the mock channel
        this.writeClientInstantiation(writer);
        writer.newLine();

        // Call the method and assert
        if (canAssertResponse) {
            writer.write("var response = ");
            writer.writeNodeStatement(endpointSnippet);
            writer.writeNodeStatement(
                this.csharp.invokeMethod({
                    on: this.Types.JsonAssert,
                    method: "AreEqual",
                    arguments_: [this.csharp.codeblock("response"), this.csharp.codeblock("mockResponse")]
                })
            );
        } else {
            writer.write("Assert.DoesNotThrowAsync(async () => ");
            writer.writeNode(endpointSnippet);
            writer.write(");");
        }
    }

    /**
     * Gets the C# type name for the endpoint's return type (the SDK wrapper type, not the proto type).
     * This is used for `JsonUtils.Deserialize<T>` / `ToProto` round-tripping in the stub handler.
     */
    private getReturnTypeName(): string | undefined {
        const responseBody = this.endpoint.response?.body;
        if (responseBody == null) {
            return undefined;
        }
        if (responseBody.type === "json") {
            const jsonResponseBody = responseBody.value;
            if (jsonResponseBody.type === "response") {
                const responseBodyType = jsonResponseBody.responseBodyType;
                if (responseBodyType.type === "named") {
                    return this.context.csharpTypeMapper.convertToClassReference(responseBodyType).name;
                }
            }
        }
        return undefined;
    }

    private writeClientInstantiation(writer: Writer): void {
        const rootClientName = this.Types.RootClient.name;
        writer.addNamespace("Grpc.Net.Client");
        writer.writeLine(`var client = new ${rootClientName}(`);
        writer.writeLine("    clientOptions: new ClientOptions");
        writer.writeLine("    {");
        writer.writeLine('        BaseUrl = "http://localhost",');
        writer.writeLine("        MaxRetries = 0,");
        writer.writeLine("        GrpcOptions = new GrpcChannelOptions");
        writer.writeLine("        {");
        writer.writeLine("            HttpClient = mock.HttpClient,");
        writer.writeLine("        }");
        writer.writeLine("    }");
        writer.writeTextStatement(")");
    }

    private getDirectory(): RelativeFilePath {
        const segments = this.getServiceNamespaceSegments();
        if (segments.length === 0) {
            return this.constants.folders.mockServerTests;
        }
        return join(this.constants.folders.mockServerTests, ...segments.map(RelativeFilePath.of));
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.constants.folders.testFiles,
            this.getDirectory(),
            RelativeFilePath.of(`${this.classReference.name}.cs`)
        );
    }
}

/**
 * Checks the rendered snippet code for patterns that produce compilation errors.
 * These are pre-existing snippet generation limitations:
 *  - `new Dictionary<` for map wrapper types (e.g., Metadata extends Dictionary)
 *  - `GoogleProtobufAny` / `GoogleRpcStatus` without proper namespace resolution
 *  - string literals assigned to byte[] fields
 */
function hasUnsupportedSnippetPattern(code: string): boolean {
    if (/new Dictionary</.test(code)) {
        return true;
    }
    if (/GoogleProtobufAny|GoogleRpcStatus/.test(code)) {
        return true;
    }
    return false;
}
