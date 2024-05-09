import { csharp } from "@fern-api/csharp-codegen";
import { HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { RawClient } from "./RawClient";

export declare namespace EndpointGenerator {
    export interface Args {
        /** the reference to the client */
        clientReference: string;
        /** the endpoint for the endpoint */
        endpoint: HttpEndpoint;
        /** reference to a variable that is the body */
        bodyReference?: string;
    }
}

const RESPONSE_VARIABLE_NAME = "response";
const RESPONSE_BODY_VARIABLE_NAME = "responseBody";

export class EndpointGenerator {
    private context: SdkGeneratorContext;
    private rawClient: RawClient;

    public constructor(context: SdkGeneratorContext, rawClient: RawClient) {
        this.context = context;
        this.rawClient = rawClient;
    }

    public generate({
        endpoint,
        rawClientReference
    }: {
        endpoint: HttpEndpoint;
        rawClientReference: string;
    }): csharp.Method {
        const parameters = this.getEndpointParameters({ endpoint });
        const return_ = this.getEndpointReturnType({ endpoint });
        return csharp.method({
            name: this.context.getEndpointMethodName(endpoint),
            access: "public",
            isAsync: true,
            parameters: parameters.values,
            summary: endpoint.docs,
            return_,
            body: csharp.codeblock((writer) => {
                writer.write(`var ${RESPONSE_VARIABLE_NAME} = `);
                writer.writeNodeStatement(
                    this.rawClient.makeRequest({
                        clientReference: rawClientReference,
                        endpoint,
                        bodyReference: parameters.bodyReference
                    })
                );
                const responseStatements = this.getEndpointResponseStatements({ endpoint });
                if (responseStatements != null) {
                    writer.writeNode(responseStatements);
                }
            })
        });
    }

    private getEndpointParameters({ endpoint }: { endpoint: HttpEndpoint }): {
        values: csharp.Parameter[];
        bodyReference: string | undefined;
    } {
        const parameters: csharp.Parameter[] = [];
        for (const pathParam of endpoint.pathParameters) {
            parameters.push(
                csharp.parameter({
                    docs: pathParam.docs,
                    name: pathParam.name.camelCase.safeName,
                    type: this.context.csharpTypeMapper.convert({ reference: pathParam.valueType })
                })
            );
        }
        const bodyParameter = endpoint.requestBody?._visit<csharp.Parameter | undefined>({
            bytes: () => {
                return undefined;
            },
            fileUpload: () => {
                return undefined;
            },
            inlinedRequestBody: () => {
                // TODO: Generate and return inlined request bodies
                return undefined;
            },
            reference: (requestReference) => {
                return csharp.parameter({
                    docs: requestReference.docs,
                    name: "request",
                    type: this.context.csharpTypeMapper.convert({ reference: requestReference.requestBodyType })
                });
            },
            _other: () => {
                return undefined;
            }
        });
        if (bodyParameter != null) {
            parameters.push(bodyParameter);
        }
        return {
            values: parameters,
            bodyReference: bodyParameter?.name
        };
    }

    private getEndpointReturnType({ endpoint }: { endpoint: HttpEndpoint }): csharp.Type | undefined {
        if (endpoint.response == null) {
            return undefined;
        }
        return endpoint.response._visit({
            fileDownload: () => undefined,
            json: (reference) => {
                return this.context.csharpTypeMapper.convert({ reference: reference.responseBodyType });
            },
            streaming: () => undefined,
            text: () => undefined,
            _other: () => undefined
        });
    }

    private getEndpointResponseStatements({ endpoint }: { endpoint: HttpEndpoint }): csharp.CodeBlock | undefined {
        if (endpoint.response == null) {
            return undefined;
        }
        return endpoint.response._visit({
            fileDownload: () => undefined,
            json: (reference) => {
                const astType = this.context.csharpTypeMapper.convert({ reference: reference.responseBodyType });
                return csharp.codeblock((writer) => {
                    writer.writeTextStatement(
                        `string ${RESPONSE_BODY_VARIABLE_NAME} = await ${RESPONSE_VARIABLE_NAME}.Raw.Content.ReadAsStringAsync()`
                    );
                    writer.writeLine(
                        `if (${RESPONSE_BODY_VARIABLE_NAME}.StatusCode >= 200 && ${RESPONSE_BODY_VARIABLE_NAME}.StatusCode < 400) {`
                    );
                    writer.writeNewLineIfLastLineNot();

                    writer.write(`return `);
                    writer.writeNode(
                        csharp.classReference({
                            name: "JsonSerializer",
                            namespace: "System.Text.Json"
                        })
                    );
                    writer.write(`.Deserialize<`);
                    writer.writeNode(astType);
                    writer.writeLine(`>(${RESPONSE_BODY_VARIABLE_NAME});`);

                    writer.indent();
                    writer.writeLine("}");
                    writer.dedent();

                    writer.writeLine(`throw new Exception();`);
                });
            },
            streaming: () => undefined,
            text: () => undefined,
            _other: () => undefined
        });
    }
}
