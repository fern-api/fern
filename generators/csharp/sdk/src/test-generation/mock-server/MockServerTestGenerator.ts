import { assertNever } from "@fern-api/core-utils";
import { CSharpFile, convertExampleTypeReferenceToTypeReference, FileGenerator } from "@fern-api/csharp-base";
import { ast, is } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { FernIr } from "@fern-fern/ir-sdk";
import {
    ExampleEndpointCall,
    ExampleResponse,
    ExampleTypeReference,
    HttpEndpoint,
    ServiceId
} from "@fern-fern/ir-sdk/api";
import { HttpEndpointGenerator } from "../../endpoint/http/HttpEndpointGenerator";
import { SdkCustomConfigSchema } from "../../SdkCustomConfig";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { MockEndpointGenerator } from "./MockEndpointGenerator";

export declare namespace TestClass {
    interface TestInput {
        objectInstantiationSnippet: ast.CodeBlock;
        json: unknown;
    }
}

export class MockServerTestGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
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
            name: `${this.endpoint.name.pascalCase.safeName}Test`,
            namespace: this.getTestNamespace()
        });

        this.endpointGenerator = new HttpEndpointGenerator({ context });
        this.mockEndpointGenerator = new MockEndpointGenerator(context);
    }

    public override shouldGenerate(): boolean {
        if (this.endpoint.pagination?.type === "custom") {
            return false;
        }
        return super.shouldGenerate();
    }

    private getTestNamespace(): string {
        const subpackage = this.context.common.getSubpackageForServiceId(this.serviceId);
        if (!subpackage) {
            return this.namespaces.mockServerTest;
        }

        return [
            this.namespaces.mockServerTest,
            ...this.context.getChildNamespaceSegments(subpackage.fernFilepath)
        ].join(".");
    }

    protected doGenerate(): CSharpFile {
        const testClass = this.csharp.testClass({
            name: this.classReference.name,
            namespace: this.getTestNamespace(),
            origin: this.classReference.origin,
            parentClassReference: this.types.BaseMockServerTest
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

            let isAsyncTest = false;
            const isPaginationEndpoint = !!this.endpoint.pagination;
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
            const methodBody = this.csharp.codeblock((writer) => {
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
                    throw new Error("Endpoint snippet is null");
                }
                if (this.endpoint.pagination) {
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
                    writer.writeNode(this.extern.System.Net.Http.HttpResponseHeaders);
                    writer.writeTextStatement(">())");
                } else {
                    if (isSupportedResponse) {
                        isAsyncTest = true;
                        writer.write("var response = ");
                        writer.writeNodeStatement(endpointSnippet);
                        if (responseBodyType === "json") {
                            const responseType = this.getCsharpTypeFromResponse(example.response);
                            const deserializeResponseNode = this.csharp.invokeMethod({
                                on: this.types.JsonUtils,
                                method: "Deserialize",
                                generics: [responseType],
                                arguments_: [this.csharp.codeblock("mockResponse")]
                            });
                            const innerType = responseType.unwrapIfOptional();
                            if (is.Type.oneOf(innerType) || is.Type.oneOfBase(innerType)) {
                                writer.writeLine(`Assert.That(
                                response.Value,
                                Is.EqualTo(`);
                                writer.writeNode(deserializeResponseNode);
                                writer.writeLine(".Value).UsingDefaults()");
                            } else {
                                if (
                                    innerType.isCollection ||
                                    is.Type.object(innerType) ||
                                    is.Type.reference(innerType) ||
                                    is.Type.coreReference(innerType)
                                ) {
                                    writer.writeLine(`Assert.That(
                                        response,
                                        Is.EqualTo(`);
                                    writer.writeNode(deserializeResponseNode);
                                    writer.writeLine(").UsingDefaults()");
                                } else {
                                    writer.writeLine(`Assert.That(
                                  response,
                                  Is.EqualTo(`);
                                    writer.writeNode(deserializeResponseNode);
                                    writer.writeLine(")");
                                }
                            }
                            writer.writeTextStatement(")");
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
        const subpackage = this.context.common.getSubpackageForServiceId(this.serviceId);
        if (!subpackage) {
            return this.constants.folders.mockServerTests;
        }
        return join(
            this.constants.folders.mockServerTests,
            ...this.context.getChildNamespaceSegments(subpackage.fernFilepath).map(RelativeFilePath.of)
        );
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

    normalizeDatetimes(obj: unknown): unknown {
        function isValidDateString(datetimeString: string): boolean {
            const date = new Date(datetimeString);
            return !isNaN(date.getTime()) && datetimeString.includes("T");
        }

        if (typeof obj === "string" && isValidDateString(obj)) {
            return new Date(obj).toISOString();
        } else if (Array.isArray(obj)) {
            return obj.map((item) => this.normalizeDatetimes(item));
        } else if (obj != null && typeof obj === "object") {
            const result: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(obj)) {
                result[key] = this.normalizeDatetimes(value);
            }
            return result;
        }

        return obj;
    }

    isValidDateString(dateString: string): boolean {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }

    getCsharpTypeFromResponse(exampleResponse: ExampleResponse): ast.Type {
        switch (exampleResponse.type) {
            case "ok":
                if (exampleResponse.value.type === "body") {
                    if (exampleResponse.value.value) {
                        const typeReference = convertExampleTypeReferenceToTypeReference(exampleResponse.value.value);
                        const type = this.context.csharpTypeMapper.convert({
                            reference: typeReference
                        });
                        return type;
                    }
                }
                throw new Error("Internal error; could not convert example response to C# type");
            case "error":
                if (exampleResponse.body) {
                    const typeReference = convertExampleTypeReferenceToTypeReference(exampleResponse.body);
                    const type = this.context.csharpTypeMapper.convert({
                        reference: typeReference
                    });
                    return type;
                }
                throw new Error("Internal error; could not convert example response to C# type");
            default:
                assertNever(exampleResponse);
        }
    }
}
