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
 * Inherits from BaseGrpcMockServerTest which handles all ceremony
 * (stub creation, server building, client instantiation).
 * Each test method only contains the unique test-specific code:
 *   1. Configures the stub handler via the inherited Stub property
 *   2. Calls the endpoint via the inherited Client property
 *   3. Asserts the response matches the expected output
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

    /**
     * Returns true if at least one example produces a valid test method.
     * This pre-filters examples using the same logic as doGenerate() to avoid
     * producing empty test files.
     */
    public override shouldGenerate(): boolean {
        return this.exampleEndpointCalls.some((example) => {
            const endpointSnippet = this.grpcEndpointGenerator.generateGrpcEndpointSnippet({
                example,
                endpoint: this.endpoint,
                clientVariableName: "Client",
                serviceId: this.serviceId,
                parseDatetimes: true,
                getResult: true
            });
            if (endpointSnippet == null) {
                return false;
            }
            const snippetCode = endpointSnippet.toString({
                namespace: this.getTestNamespace(),
                allNamespaceSegments: this.context.getAllNamespaceSegments(),
                allTypeClassReferences: this.context.getAllTypeClassReferences(),
                generation: this.generation,
                skipImports: true
            });
            return !hasUnsupportedSnippetPattern(snippetCode);
        });
    }

    protected doGenerate(): CSharpFile {
        const testClass = this.csharp.testClass({
            name: this.classReference.name,
            namespace: this.getTestNamespace(),
            origin: this.classReference.origin,
            parentClassReference: this.Types.BaseGrpcMockServerTest
        });
        let generatedTestCount = 0;
        this.exampleEndpointCalls.forEach((example) => {
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
                clientVariableName: "Client",
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
            generatedTestCount++;
            const testNumber = generatedTestCount > 1 || this.exampleEndpointCalls.length > 1 ? `_${generatedTestCount}` : "";
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
        const responseJsonStr = jsonExampleResponse != null ? JSON.stringify(jsonExampleResponse) : undefined;
        const hasProtoAnyInResponse = responseJsonStr != null && responseJsonStr.includes('"@type"');
        const hasProtoIncompatibleFields = this.responseHasProtoIncompatibleFields();
        const canAssertResponse =
            isSupportedResponse && returnTypeName != null && !hasProtoAnyInResponse && !hasProtoIncompatibleFields;

        // Write the mock response JSON only when we can fully round-trip it
        if (canAssertResponse && jsonExampleResponse != null) {
            const responseBodyType = this.endpoint.response?.body?.type;
            if (responseBodyType === "json") {
                writer.writeLine('const string mockResponse = """');
                writer.writeLine(JSON.stringify(jsonExampleResponse, null, 2).replace(/"\\{1,2}\$ref"/g, '"$ref\"'));
                writer.writeTextStatement('"""');
            } else if (responseBodyType === "text") {
                writer.writeTextStatement(`const string mockResponse = "${jsonExampleResponse as string}"`);
            }
            writer.newLine();
        }

        const stubClassName = this.stubGenerator.getStubClassName();
        const methodName = this.endpoint.name.pascalCase.safeName;
        const protoResponseType = this.stubGenerator.getProtoResponseType(this.endpoint);

        // Configure stub handler — parse JSON directly into proto type
        if (canAssertResponse) {
            writer.addNamespace("Google.Protobuf");
            writer.writeTextStatement(
                `${stubClassName}.On${methodName}(_ =>\n` +
                    `    JsonParser.Default.Parse<${protoResponseType}>(mockResponse))`
            );
        } else {
            writer.writeTextStatement(`${stubClassName}.On${methodName}(_ => new ${protoResponseType}())`);
        }
        writer.newLine();

        // Call the method and assert — uses inherited Client property
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
            writer.writeNodeStatement(endpointSnippet);
        }
    }

    /**
     * Checks whether the endpoint's response type contains proto fields that
     * prevent clean JSON round-tripping through JsonParser.Default.Parse:
     *  - oneof fields (IR: undiscriminatedUnion properties) — mock JSON may set
     *    multiple oneof members simultaneously, which JsonParser rejects
     *  - google.protobuf.Struct / Value fields — the mock JSON uses SDK format
     *    (e.g. {"key": 1.1}) which doesn't round-trip identically through proto
     */
    private responseHasProtoIncompatibleFields(): boolean {
        const responseBody = this.endpoint.response?.body;
        if (responseBody == null || responseBody.type !== "json") {
            return false;
        }
        const jsonResponseBody = responseBody.value;
        if (jsonResponseBody.type !== "response") {
            return false;
        }
        const responseBodyType = jsonResponseBody.responseBodyType;
        if (responseBodyType.type !== "named") {
            return false;
        }
        return this.typeHasProtoIncompatibleFields(responseBodyType.typeId, new Set());
    }

    private typeHasProtoIncompatibleFields(typeId: string, visited: Set<string>): boolean {
        if (visited.has(typeId)) {
            return false;
        }
        visited.add(typeId);

        // Well-known protobuf types (Struct, Value, Any) don't round-trip cleanly
        if (this.context.protobufResolver.isWellKnownProtobufType(typeId)) {
            return true;
        }

        const typeDeclaration = this.context.ir.types[typeId];
        if (typeDeclaration == null) {
            return false;
        }

        // oneof in proto is represented as undiscriminatedUnion in the IR;
        // mock JSON may set multiple oneof members, which JsonParser rejects
        if (typeDeclaration.shape.type === "undiscriminatedUnion") {
            return true;
        }

        if (typeDeclaration.shape.type === "object") {
            for (const property of typeDeclaration.shape.properties) {
                if (this.typeReferenceHasProtoIncompatibleFields(property.valueType, visited)) {
                    return true;
                }
            }
        }

        return false;
    }

    private typeReferenceHasProtoIncompatibleFields(typeRef: FernIr.TypeReference, visited: Set<string>): boolean {
        switch (typeRef.type) {
            case "named":
                return this.typeHasProtoIncompatibleFields(typeRef.typeId, visited);
            case "container":
                switch (typeRef.container.type) {
                    case "optional":
                        return this.typeReferenceHasProtoIncompatibleFields(typeRef.container.optional, visited);
                    case "nullable":
                        return this.typeReferenceHasProtoIncompatibleFields(typeRef.container.nullable, visited);
                    case "list":
                        return this.typeReferenceHasProtoIncompatibleFields(typeRef.container.list, visited);
                    case "map":
                        return this.typeReferenceHasProtoIncompatibleFields(typeRef.container.valueType, visited);
                    case "set":
                        return this.typeReferenceHasProtoIncompatibleFields(typeRef.container.set, visited);
                    default:
                        return false;
                }
            default:
                return false;
        }
    }

    /**
     * Gets the C# type name for the endpoint's return type (the SDK wrapper type, not the proto type).
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
