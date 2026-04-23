import { GeneratorError } from "@fern-api/base-generator";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, Writer } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { FernIr } from "@fern-fern/ir-sdk";

type ExampleEndpointCall = FernIr.ExampleEndpointCall;
type ExampleTypeReference = FernIr.ExampleTypeReference;
type HttpEndpoint = FernIr.HttpEndpoint;
type ServiceId = FernIr.ServiceId;

import { HttpEndpointGenerator } from "../../endpoint/http/HttpEndpointGenerator.js";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { MockEndpointGenerator } from "./MockEndpointGenerator.js";

export declare namespace TestClass {
    interface TestInput {
        objectInstantiationSnippet: ast.CodeBlock;
        json: unknown;
    }
}

export class MockServerTestGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private readonly classReference: ast.ClassReference;
    private readonly endpointGenerator: HttpEndpointGenerator;
    private readonly mockEndpointGenerator: MockEndpointGenerator;

    constructor(
        context: SdkGeneratorContext,
        private readonly exampleEndpointCalls: ExampleEndpointCall[],
        private readonly endpoint: HttpEndpoint,
        private readonly serviceId: ServiceId
    ) {
        super(context);

        this.classReference = this.csharp.classReference({
            origin: this.model.explicit(this.endpoint, `Test${this.getTestNamespace()}`),
            name: `${this.case.pascalSafe(this.endpoint.name)}Test`,
            namespace: this.getTestNamespace()
        });

        this.endpointGenerator = new HttpEndpointGenerator({ context });
        this.mockEndpointGenerator = new MockEndpointGenerator(context);
    }

    public override shouldGenerate(): boolean {
        if (
            this.endpoint.pagination?.type === "custom" ||
            this.endpoint.pagination?.type === "uri" ||
            this.endpoint.pagination?.type === "path"
        ) {
            return false;
        }
        return super.shouldGenerate();
    }

    /**
     * Returns true only when pagination clients are actually generated for this endpoint.
     * The IR may have pagination info even when `generatePaginatedClients` is disabled,
     * so we must check the config flag to avoid emitting `await foreach` against a
     * non-IAsyncEnumerable return type.
     */
    private hasPaginationEnabled(): boolean {
        return this.context.config.generatePaginatedClients === true && this.endpoint.pagination != null;
    }

    private getServiceNamespaceSegments(): string[] {
        const subpackage = this.context.getSubpackageForServiceId(this.serviceId);
        if (!subpackage) {
            return [];
        }
        // Use allParts (not packagePath) to include the service name itself,
        // ensuring each service gets its own subdirectory and namespace.
        return subpackage.fernFilepath.allParts.map((part) => this.case.pascalSafe(part));
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
            origin: this.classReference.origin,
            parentClassReference: this.Types.BaseMockServerTest
        });
        this.exampleEndpointCalls.forEach((example, index) => {
            let jsonExampleResponse: unknown | undefined = undefined;
            if (example.response != null) {
                if (example.response.type !== "ok" || example.response.value.type !== "body") {
                    throw GeneratorError.internalError("Unexpected error response type");
                }
                jsonExampleResponse = example.response.value.value?.jsonExample;
            }
            const responseBodyType = this.endpoint.response?.body?.type;

            let isAsyncTest = false;
            const isPaginationEndpoint = this.hasPaginationEnabled();
            if (isPaginationEndpoint) {
                isAsyncTest = true;
            }
            const isHeadEndpoint =
                this.endpoint.method === FernIr.HttpMethod.Head && this.endpoint.response?.body == null;
            if (isHeadEndpoint) {
                isAsyncTest = true;
            }
            const isSupportedResponse =
                jsonExampleResponse != null && (responseBodyType === "json" || responseBodyType === "text");
            if (isSupportedResponse) {
                isAsyncTest = true;
            }
            const methodBody = this.csharp.codeblock((writer: Writer) => {
                writer.writeNode(this.mockEndpointGenerator.generateForExample(this.endpoint, example));

                writer.newLine();

                const endpointSnippet = this.endpointGenerator.generateEndpointSnippet({
                    example,
                    endpoint: this.endpoint,
                    clientVariableName: "Client",
                    serviceId: this.serviceId,
                    getResult: true,
                    parseDatetimes: true
                });
                if (endpointSnippet == null) {
                    throw GeneratorError.internalError("Endpoint snippet is null");
                }
                if (this.hasPaginationEnabled()) {
                    writer.write("var items = ");
                    writer.writeNode(endpointSnippet);
                    writer.write(";");
                    writer.newLine();
                    writer.write("await foreach (var item in items)");
                    writer.newLine();
                    writer.pushScope();

                    writer.writeTextStatement("Assert.That(item, Is.Not.Null)");
                    writer.writeLine("break; // Only check the first item");

                    writer.popScope();
                } else if (isHeadEndpoint) {
                    isAsyncTest = true;
                    writer.write("var headers = ");
                    writer.writeNodeStatement(endpointSnippet);
                    writer.writeTextStatement("Assert.That(headers, Is.Not.Null)");
                    writer.write("Assert.That(headers, Is.InstanceOf<");
                    writer.writeNode(this.System.Net.Http.HttpResponseHeaders);
                    writer.writeTextStatement(">())");
                } else {
                    if (isSupportedResponse) {
                        isAsyncTest = true;
                        writer.write("var response = ");
                        writer.writeNodeStatement(endpointSnippet);
                        if (responseBodyType === "json") {
                            writer.writeNodeStatement(
                                this.csharp.invokeMethod({
                                    on: this.Types.JsonAssert,
                                    method: "AreEqual",
                                    arguments_: [
                                        this.csharp.codeblock("response"),
                                        this.csharp.codeblock("mockResponse")
                                    ]
                                })
                            );
                        } else if (responseBodyType === "text") {
                            writer.writeTextStatement("Assert.That(response, Is.EqualTo(mockResponse))");
                        }
                    } else {
                        if (endpointSnippet?.isAsyncEnumerable) {
                            writer.write("Assert.DoesNotThrowAsync(async () =>");
                            writer.pushScope();
                            writer.write("await foreach (var item in ");
                            writer.writeNode(endpointSnippet);
                            writer.writeLine(")");
                            writer.pushScope();
                            writer.writeLine("/* consume each item */");
                            writer.popScope();
                            writer.popScope();
                            writer.write(");");
                        } else {
                            writer.write("Assert.DoesNotThrowAsync(async () => ");
                            writer.writeNode(endpointSnippet);
                            writer.write(");");
                        }
                    }
                }
            });
            const testNumber = this.exampleEndpointCalls.length > 1 ? `_${index + 1}` : "";
            testClass.addTestMethod({
                name: `MockServerTest${testNumber}`,
                body: methodBody,
                isAsync: isAsyncTest
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
            RelativeFilePath.of(`${this.getTestClassName()}.cs`)
        );
    }

    /*
     If the example not a string, skip for now. If it's a string, check if it's a datetime
     and normalize the string so that we can match it in wire tests.
     */
    private exampleToQueryOrHeaderValue({ value }: { value: ExampleTypeReference }): string | undefined {
        if (typeof value.jsonExample === "string") {
            const maybeDatetime = this.getDateTime(value);
            return maybeDatetime != null ? maybeDatetime.toISOString() : value.jsonExample;
        }
        if (typeof value.jsonExample === "number") {
            return value.jsonExample.toString();
        }
        return undefined;
    }

    private getTestClassName(): string {
        return this.classReference.name;
    }

    private getDateTime(exampleTypeReference: ExampleTypeReference): Date | undefined {
        switch (exampleTypeReference.shape.type) {
            case "container":
                if (exampleTypeReference.shape.container.type !== "optional") {
                    return undefined;
                }
                if (exampleTypeReference.shape.container.optional == null) {
                    return undefined;
                }
                return this.getDateTime(exampleTypeReference.shape.container.optional);
            case "named":
                if (exampleTypeReference.shape.shape.type !== "alias") {
                    return undefined;
                }
                return this.getDateTime(exampleTypeReference.shape.shape.value);
            case "primitive":
                return exampleTypeReference.shape.primitive.type === "datetime"
                    ? exampleTypeReference.shape.primitive.datetime
                    : undefined;
            case "unknown":
                return undefined;
        }
    }
}
