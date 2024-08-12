import { csharp } from "@fern-api/csharp-codegen";
import { ExampleGenerator } from "@fern-api/fern-csharp-model";
import {
    ExampleEndpointCall,
    ExampleRequestBody,
    FernFilepath,
    HttpEndpoint,
    ResponseError,
    SdkRequestShape,
    ServiceId
} from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { WrappedRequestGenerator } from "../wrapped-request/WrappedRequestGenerator";
import { RawClient } from "./RawClient";
import { EndpointRequest } from "./request/EndpointRequest";
import { createEndpointRequest } from "./request/EndpointRequestFactory";

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
    private exampleGenerator: ExampleGenerator;

    public constructor(readonly context: SdkGeneratorContext) {
        this.context = context;
        this.exampleGenerator = new ExampleGenerator(context);
    }

    public generate({
        serviceId,
        endpoint,
        rawClientReference,
        rawClient
    }: {
        serviceId: ServiceId;
        endpoint: HttpEndpoint;
        rawClientReference: string;
        rawClient: RawClient;
    }): csharp.Method {
        const { parameters: nonEndpointParameters, pathParameterReferences } = this.getNonEndpointParameters({
            endpoint,
            serviceId
        });
        const parameters = [...nonEndpointParameters];
        const request = this.getEndpointRequest({ endpoint, serviceId });
        if (request != null) {
            parameters.push(
                csharp.parameter({
                    type: request.getParameterType(),
                    name: request.getParameterName()
                })
            );
        }
        parameters.push(
            csharp.parameter({
                type: csharp.Type.optional(csharp.Type.reference(this.context.getRequestOptionsClassReference())),
                name: this.context.getRequestOptionsParameterName(),
                initializer: "null"
            })
        );
        const return_ = this.getEndpointReturnType({ endpoint });
        return csharp.method({
            name: this.context.getEndpointMethodName(endpoint),
            access: "public",
            isAsync: true,
            parameters,
            summary: endpoint.docs,
            return_,
            body: csharp.codeblock((writer) => {
                const queryParameterCodeBlock = request?.getQueryParameterCodeBlock();
                if (queryParameterCodeBlock != null) {
                    queryParameterCodeBlock.code.write(writer);
                }
                const headerParameterCodeBlock = request?.getHeaderParameterCodeBlock();
                if (headerParameterCodeBlock != null) {
                    headerParameterCodeBlock.code.write(writer);
                }
                const requestBodyCodeBlock = request?.getRequestBodyCodeBlock();
                if (requestBodyCodeBlock?.code != null) {
                    writer.writeNode(requestBodyCodeBlock.code);
                }
                writer.write(`var ${RESPONSE_VARIABLE_NAME} = `);
                writer.writeNodeStatement(
                    rawClient.makeRequest({
                        baseUrl: this.getBaseURLForEndpoint({ endpoint }),
                        requestType: request?.getRequestType(),
                        clientReference: rawClientReference,
                        endpoint,
                        bodyReference: requestBodyCodeBlock?.requestBodyReference,
                        pathParameterReferences,
                        headerBagReference: headerParameterCodeBlock?.headerParameterBagReference,
                        queryBagReference: queryParameterCodeBlock?.queryParameterBagReference
                    })
                );
                const successResponseStatements = this.getEndpointSuccessResponseStatements({ endpoint });
                if (successResponseStatements != null) {
                    writer.writeNode(successResponseStatements);
                }
                writer.writeNode(this.getEndpointErrorHandling({ endpoint }));
            })
        });
    }

    public generateEndpointSnippet({
        example,
        endpoint,
        clientVariableName,
        serviceId,
        serviceFilePath,
        getResult = false
    }: {
        example: ExampleEndpointCall;
        endpoint: HttpEndpoint;
        clientVariableName: string;
        serviceId: ServiceId;
        serviceFilePath: FernFilepath;
        getResult?: boolean;
    }): csharp.MethodInvocation | undefined {
        const requestBodyType = endpoint.requestBody?.type;
        // TODO: implement these
        if (requestBodyType === "fileUpload" || requestBodyType === "bytes") {
            return undefined;
        }
        const args = this.getNonEndpointArguments(example);
        const endpointRequestSnippet = this.getEndpointRequestSnippet(example, endpoint, serviceId);
        if (endpointRequestSnippet != null) {
            args.push(endpointRequestSnippet);
        }
        const on = csharp.codeblock((writer) => {
            writer.write(`${clientVariableName}`);
            for (const path of serviceFilePath.allParts) {
                writer.write(`.${path.pascalCase.safeName}`);
            }
        });
        this.getEndpointReturnType({ endpoint });
        return new csharp.MethodInvocation({
            method: this.context.getEndpointMethodName(endpoint),
            arguments_: args,
            on,
            async: false,
            generics: [],
            result: getResult ? (this.getEndpointReturnType({ endpoint }) != null ? "value" : "void") : undefined
        });
    }

    private getBaseURLForEndpoint({ endpoint }: { endpoint: HttpEndpoint }): csharp.CodeBlock {
        if (endpoint.baseUrl != null && this.context.ir.environments?.environments.type === "multipleBaseUrls") {
            const baseUrl = this.context.ir.environments?.environments.baseUrls.find(
                (baseUrlWithId) => baseUrlWithId.id === endpoint.baseUrl
            );
            if (baseUrl != null) {
                return csharp.codeblock(`_client.Options.Environment.${baseUrl.name.pascalCase.safeName}`);
            }
        }
        return csharp.codeblock("_client.Options.BaseUrl");
    }

    private getEndpointRequestSnippet(
        exampleEndpointCall: ExampleEndpointCall,
        endpoint: HttpEndpoint,
        serviceId: ServiceId
    ): csharp.CodeBlock | undefined {
        switch (endpoint.sdkRequest?.shape.type) {
            case "wrapper":
                return new WrappedRequestGenerator({
                    wrapper: endpoint.sdkRequest.shape,
                    context: this.context,
                    serviceId,
                    endpoint
                }).doGenerateSnippet(exampleEndpointCall);
            case "justRequestBody": {
                if (exampleEndpointCall.request == null) {
                    throw new Error("Unexpected no example request for just request body");
                }
                return this.getJustRequestBodySnippet(exampleEndpointCall.request, endpoint.sdkRequest.shape);
            }
        }
        return undefined;
    }

    private getJustRequestBodySnippet(
        exampleRequestBody: ExampleRequestBody,
        shape: SdkRequestShape.JustRequestBody
    ): csharp.CodeBlock {
        if (exampleRequestBody.type === "inlinedRequestBody") {
            throw new Error("Unexpected inlinedRequestBody"); // should be a wrapped request and already handled
        }
        return this.exampleGenerator.getSnippetForTypeReference(exampleRequestBody);
        // switch (exampleRequestBody.type) {
        //     case "reference":
        //         return this.exampleGenerator.getSnippetForTypeReference(exampleRequestBody);
        //     case "inlinedRequestBody": {
        //         const args: { name: string; assignment: CodeBlock }[] = [];
        //         for (const property of exampleRequestBody.properties) {
        //             const value = this.exampleGenerator.getSnippetForTypeReference(property.value);
        //             args.push({ name: property.name.name.pascalCase.safeName, assignment: value });
        //         }
        //         if (shape.value.type === "bytes") {
        //             throw new Error("Unexpected bytes type");
        //         }
        //         const instantiateClass = csharp.instantiateClass({
        //             classReference: this.classReference,
        //             arguments_: args
        //         });
        //     }
        //     default:
        // }
    }

    private getEndpointRequest({
        endpoint,
        serviceId
    }: {
        endpoint: HttpEndpoint;
        serviceId: ServiceId;
    }): EndpointRequest | undefined {
        if (endpoint.sdkRequest == null) {
            return undefined;
        }
        return createEndpointRequest({
            context: this.context,
            endpoint,
            serviceId,
            sdkRequest: endpoint.sdkRequest
        });
    }

    private getNonEndpointArguments(example: ExampleEndpointCall): csharp.CodeBlock[] {
        const pathParameters = [
            ...example.rootPathParameters,
            ...example.servicePathParameters,
            ...example.endpointPathParameters
        ];
        return pathParameters.map((pathParameter) =>
            this.exampleGenerator.getSnippetForTypeReference(pathParameter.value)
        );
    }

    private getNonEndpointParameters({ endpoint, serviceId }: { endpoint: HttpEndpoint; serviceId: ServiceId }): {
        parameters: csharp.Parameter[];
        pathParameterReferences: Record<string, string>;
    } {
        const parameters: csharp.Parameter[] = [];
        const service = this.context.getHttpServiceOrThrow(serviceId);
        const pathParameterReferences: Record<string, string> = {};
        for (const pathParam of [
            ...this.context.ir.pathParameters,
            ...service.pathParameters,
            ...endpoint.pathParameters
        ]) {
            const parameterName = pathParam.name.camelCase.safeName;
            pathParameterReferences[pathParam.name.originalName] = parameterName;
            parameters.push(
                csharp.parameter({
                    docs: pathParam.docs,
                    name: parameterName,
                    type: this.context.csharpTypeMapper.convert({ reference: pathParam.valueType })
                })
            );
        }
        return {
            parameters,
            pathParameterReferences
        };
    }

    private getEndpointReturnType({ endpoint }: { endpoint: HttpEndpoint }): csharp.Type | undefined {
        if (endpoint.response?.body == null) {
            return undefined;
        }
        return endpoint.response.body._visit({
            streamParameter: () => undefined,
            fileDownload: () => undefined,
            json: (reference) => {
                return this.context.csharpTypeMapper.convert({ reference: reference.responseBodyType });
            },
            streaming: () => undefined,
            text: () => csharp.Type.string(),
            _other: () => undefined
        });
    }

    private getEndpointErrorHandling({ endpoint }: { endpoint: HttpEndpoint }): csharp.CodeBlock {
        return csharp.codeblock((writer) => {
            if (endpoint.response?.body == null) {
                writer.writeTextStatement(
                    `var ${RESPONSE_BODY_VARIABLE_NAME} = await ${RESPONSE_VARIABLE_NAME}.Raw.Content.ReadAsStringAsync()`
                );
            }
            if (
                endpoint.errors.length > 0 &&
                this.context.ir.errorDiscriminationStrategy.type === "statusCode" &&
                (this.context.customConfig["generate-error-types"] ?? true)
            ) {
                writer.writeLine("try");
                writer.writeLine("{");
                writer.indent();
                writer.write("switch (");
                writer.write(`${RESPONSE_VARIABLE_NAME}.StatusCode)`);

                writer.writeLine("{");
                writer.indent();
                for (const error of endpoint.errors) {
                    this.writeErrorCase(error, writer);
                }
                writer.writeLine("}");
                writer.dedent();
                writer.writeLine("}");
                writer.writeLine("catch (");
                writer.writeNode(this.context.getJsonExceptionClassReference());
                writer.writeLine(")");
                writer.writeLine("{");
                writer.indent();
                writer.writeLine("// unable to map error response, throwing generic error");
                writer.dedent();
                writer.writeLine("}");
            }
            writer.write("throw new ");
            writer.writeNode(this.context.getBaseApiExceptionClassReference());
            writer.write(
                `($"Error with status code {${RESPONSE_VARIABLE_NAME}.StatusCode}", ${RESPONSE_VARIABLE_NAME}.StatusCode, `
            );
            writer.writeTextStatement(`${RESPONSE_BODY_VARIABLE_NAME})`);
        });
    }

    private writeErrorCase(error: ResponseError, writer: csharp.Writer) {
        const fullError = this.context.ir.errors[error.error.errorId];
        if (fullError == null) {
            throw new Error("Unexpected no error found for error id: " + error.error.errorId);
        }
        writer.writeLine(`case ${fullError.statusCode}:`);
        writer.indent();
        writer.write("throw new ");
        writer.writeNode(this.context.getExceptionClassReference(fullError.name));
        writer.write("(");
        writer.writeNode(this.context.getJsonUtilsClassReference());
        writer.write(".Deserialize<");
        writer.writeNode(
            fullError.type != null
                ? this.context.csharpTypeMapper.convert({ reference: fullError.type })
                : csharp.Type.object()
        );
        writer.writeTextStatement(`>(${RESPONSE_BODY_VARIABLE_NAME}))`);
    }

    private getEndpointSuccessResponseStatements({
        endpoint
    }: {
        endpoint: HttpEndpoint;
    }): csharp.CodeBlock | undefined {
        if (endpoint.response?.body == null) {
            return csharp.codeblock((writer) => {
                writer.writeLine(`if (${RESPONSE_VARIABLE_NAME}.StatusCode is >= 200 and < 400) {`);
                writer.indent();
                writer.writeLine("return;");
                writer.dedent();
                writer.writeLine("}");
            });
        }
        const body = endpoint.response.body;
        return csharp.codeblock((writer) => {
            writer.writeTextStatement(
                `var ${RESPONSE_BODY_VARIABLE_NAME} = await ${RESPONSE_VARIABLE_NAME}.Raw.Content.ReadAsStringAsync()`
            );
            body._visit({
                streamParameter: () => this.context.logger.error("Stream parameters not supported"),
                fileDownload: () => this.context.logger.error("File download not supported"),
                json: (reference) => {
                    const astType = this.context.csharpTypeMapper.convert({ reference: reference.responseBodyType });
                    writer.writeLine(`if (${RESPONSE_VARIABLE_NAME}.StatusCode is >= 200 and < 400) {`);
                    writer.writeNewLineIfLastLineNot();

                    // Deserialize the response as json
                    writer.indent();
                    writer.writeLine("try");
                    writer.writeLine("{");
                    writer.indent();
                    writer.write("return ");
                    writer.writeNode(this.context.getJsonUtilsClassReference());
                    writer.write(".Deserialize<");
                    writer.writeNode(astType);
                    // todo: Maybe remove ! below and handle potential null. Requires introspecting type to know if its
                    // nullable.
                    writer.writeLine(`>(${RESPONSE_BODY_VARIABLE_NAME})!;`);
                    writer.dedent();
                    writer.writeLine("}");
                    writer.write("catch (");
                    writer.writeNode(this.context.getJsonExceptionClassReference());
                    writer.writeLine(" e)");
                    writer.writeLine("{");
                    writer.indent();
                    writer.write("throw new ");
                    writer.writeNode(this.context.getBaseExceptionClassReference());
                    writer.writeTextStatement('("Failed to deserialize response", e)');
                    writer.dedent();
                    writer.writeLine("}");
                    writer.dedent();
                    writer.writeLine("}");
                    writer.writeLine();
                },
                streaming: () => this.context.logger.error("Streaming not supported"),
                text: () => {
                    writer.writeLine(`if (${RESPONSE_VARIABLE_NAME}.StatusCode is >= 200 and < 400) {`);
                    writer.writeNewLineIfLastLineNot();

                    writer.writeTextStatement(`return ${RESPONSE_BODY_VARIABLE_NAME}`);

                    writer.indent();
                    writer.writeLine("}");
                    writer.dedent();
                },
                _other: () => undefined
            });
        });
    }
}
