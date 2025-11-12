import { ast, text, WithGeneration } from "@fern-api/csharp-codegen";
import { ExampleEndpointCall, ExampleTypeReference, HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { getContentTypeFromRequestBody } from "../../endpoint/utils/getContentTypeFromRequestBody";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export declare namespace TestClass {
    interface TestInput {
        objectInstantiationSnippet: ast.CodeBlock;
        json: unknown;
    }
}

export class MockEndpointGenerator extends WithGeneration {
    constructor(private readonly context: SdkGeneratorContext) {
        super(context.generation);
    }

    public generateForExample(endpoint: HttpEndpoint, example: ExampleEndpointCall): ast.CodeBlock {
        return this.generateForExamples(endpoint, [example]);
    }

    public generateForExamples(endpoint: HttpEndpoint, examples: ExampleEndpointCall[]): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            examples.forEach((example, index) => {
                const suffix = examples.length === 1 ? "" : `_${index}`;
                let responseSupported = false;
                let jsonExampleResponse: unknown | undefined = undefined;
                if (example.response != null) {
                    if (example.response.type !== "ok" || example.response.value.type !== "body") {
                        throw new Error("Unexpected error response type");
                    }
                    jsonExampleResponse = example.response.value.value?.jsonExample;
                }
                const responseBodyType = endpoint.response?.body?.type;
                // whether or not we support this response type in this generator; the example json may
                // have a response that we can return, but our generated method actually returns void
                responseSupported =
                    jsonExampleResponse != null && (responseBodyType === "json" || responseBodyType === "text");

                if (example.request != null) {
                    writer.writeLine(`const string requestJson${suffix} = """`);
                    writer.writeLine(
                        JSON.stringify(example.request.jsonExample, text.normalizeDates, 2).replace(
                            /"\\{1,2}\$ref"/g,
                            '"$ref\"'
                        )
                    );
                    writer.writeTextStatement('"""');
                }
                writer.newLine();

                if (jsonExampleResponse != null) {
                    if (responseBodyType === "json") {
                        writer.writeLine(`const string mockResponse${suffix} = """`);
                        writer.writeLine(
                            JSON.stringify(jsonExampleResponse, text.normalizeDates, 2).replace(
                                /"\\{1,2}\$ref"/g,
                                '"$ref\"'
                            )
                        );
                        writer.writeTextStatement('"""');
                    } else if (responseBodyType === "text") {
                        writer.writeTextStatement(
                            `const string mockResponse${suffix} = "${jsonExampleResponse as string}"`
                        );
                    }
                }

                writer.newLine();

                writer.write("Server.Given(WireMock.RequestBuilders.Request.Create()");
                writer.write(`.WithPath("${example.url || "/"}")`);

                for (const parameter of example.queryParameters) {
                    const maybeParameterValue = this.exampleToQueryOrHeaderValue(parameter);
                    if (maybeParameterValue != null) {
                        writer.write(`.WithParam("${parameter.name.wireValue}", "${maybeParameterValue}")`);
                    }
                }
                for (const header of [...example.serviceHeaders, ...example.endpointHeaders]) {
                    const maybeHeaderValue = this.exampleToQueryOrHeaderValue(header);
                    if (maybeHeaderValue != null) {
                        writer.write(`.WithHeader("${header.name.wireValue}", "${maybeHeaderValue}")`);
                    }
                }
                const requestContentType = getContentTypeFromRequestBody(endpoint);
                if (requestContentType) {
                    writer.write(`.WithHeader("Content-Type", "${requestContentType}")`);
                }

                writer.write(
                    `.Using${endpoint.method.charAt(0).toUpperCase()}${endpoint.method.slice(1).toLowerCase()}()`
                );
                if (example.request != null) {
                    if (typeof example.request.jsonExample !== "object") {
                        // Not entirely sure why we can't use BodyAsJson here, but it causes test failure
                        writer.write(`.WithBody(requestJson${suffix})`);
                    } else {
                        writer.write(`.WithBodyAsJson(requestJson${suffix})`);
                    }
                }
                writer.writeLine(")");
                writer.newLine();
                writer.writeLine(".RespondWith(WireMock.ResponseBuilders.Response.Create()");
                writer.writeLine(".WithStatusCode(200)");
                if (responseSupported) {
                    writer.writeTextStatement(`.WithBody(mockResponse${suffix}))`);
                } else {
                    writer.writeTextStatement(")");
                }
            });
        });
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
