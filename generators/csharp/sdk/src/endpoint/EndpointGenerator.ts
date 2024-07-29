import { csharp } from "@fern-api/csharp-codegen";
import { ExampleGenerator } from "@fern-api/fern-csharp-model";
import { ExampleEndpointCall, HttpEndpoint, ServiceId } from "@fern-fern/ir-sdk/api";
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

const REQUEST_PARAMETER_NAME = "request";
const RESPONSE_VARIABLE_NAME = "response";
const RESPONSE_BODY_VARIABLE_NAME = "responseBody";

export class EndpointGenerator {
    private context: SdkGeneratorContext;
    private rawClient: RawClient;
    private exampleGenerator: ExampleGenerator;
    private serviceId: string;

    public constructor(context: SdkGeneratorContext, rawClient: RawClient, serviceId: string) {
        this.context = context;
        this.rawClient = rawClient;
        this.exampleGenerator = new ExampleGenerator(context);
        this.serviceId = serviceId;
    }

    public generate({
        serviceId,
        endpoint,
        rawClientReference
    }: {
        serviceId: ServiceId;
        endpoint: HttpEndpoint;
        rawClientReference: string;
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
                if (endpoint.response?.body != null) {
                    writer.write(`var ${RESPONSE_VARIABLE_NAME} = `);
                }
                writer.writeNodeStatement(
                    this.rawClient.makeRequest({
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
                const responseStatements = this.getEndpointResponseStatements({ endpoint });
                if (responseStatements != null) {
                    writer.writeNode(responseStatements);
                }
            })
        });
    }

    public generateEndpointSnippet(
        example: ExampleEndpointCall,
        endpoint: HttpEndpoint,
        on: csharp.CodeBlock
    ): csharp.MethodInvocation | undefined {
        const args = this.getNonEndpointArguments(example);
        const endpointRequestSnippet = this.getEndpointRequestSnippet(example, endpoint);
        if (endpointRequestSnippet != null) {
            args.push(endpointRequestSnippet);
        }
        const methodInvocationArgs: csharp.MethodInvocation.Args = {
            method: this.context.getEndpointMethodName(endpoint),
            arguments_: args,
            on,
            async: true,
            generics: []
        };
        return new csharp.MethodInvocation(methodInvocationArgs);
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
        endpoint: HttpEndpoint
    ): csharp.CodeBlock | undefined {
        if (exampleEndpointCall.request == null) {
            return undefined;
        }
        if (endpoint.sdkRequest == null) {
            throw new Error("Unexpected null sdkRequest");
        }
        if (endpoint.sdkRequest.shape.type !== "wrapper") {
            return undefined;
        }
        return new WrappedRequestGenerator({
            wrapper: endpoint.sdkRequest.shape,
            context: this.context,
            serviceId: this.serviceId,
            endpoint
        }).doGenerateSnippet(exampleEndpointCall);
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
            text: () => undefined,
            _other: () => undefined
        });
    }

    private getEndpointResponseStatements({ endpoint }: { endpoint: HttpEndpoint }): csharp.CodeBlock | undefined {
        if (endpoint.response?.body == null) {
            return undefined;
        }
        return endpoint.response.body._visit({
            streamParameter: () => undefined,
            fileDownload: () => undefined,
            json: (reference) => {
                const astType = this.context.csharpTypeMapper.convert({ reference: reference.responseBodyType });
                return csharp.codeblock((writer) => {
                    writer.writeTextStatement(
                        `var ${RESPONSE_BODY_VARIABLE_NAME} = await ${RESPONSE_VARIABLE_NAME}.Raw.Content.ReadAsStringAsync()`
                    );
                    writer.writeLine(`if (${RESPONSE_VARIABLE_NAME}.StatusCode is >= 200 and < 400) {`);
                    writer.writeNewLineIfLastLineNot();

                    // Deserialize the response as json
                    writer.write("return ");
                    writer.writeNode(this.context.getJsonUtilsClassReference());
                    writer.write(".Deserialize<");
                    writer.writeNode(astType);
                    // todo: Maybe remove ! below and handle potential null. Requires introspecting type to know if its
                    // nullable.
                    writer.writeLine(`>(${RESPONSE_BODY_VARIABLE_NAME})!;`);

                    writer.indent();
                    writer.writeLine("}");
                    writer.dedent();

                    writer.writeLine(`throw new Exception(${RESPONSE_BODY_VARIABLE_NAME});`);
                });
            },
            streaming: () => undefined,
            text: () => undefined,
            _other: () => undefined
        });
    }
}
