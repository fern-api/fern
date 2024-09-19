import { php } from "@fern-api/php-codegen";
import { HttpEndpoint, ServiceId } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { getEndpointReturnType } from "../utils/getEndpointReturnType";
import { AbstractEndpointGenerator } from "../AbstractEndpointGenerator";

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

const RESPONSE_VARIABLE_NAME = "$response";
const STATUS_CODE_VARIABLE_NAME = "$statusCode";

export class HttpEndpointGenerator extends AbstractEndpointGenerator {
    public constructor({ context }: { context: SdkGeneratorContext }) {
        super({ context });
    }

    public generate({ serviceId, endpoint }: { serviceId: ServiceId; endpoint: HttpEndpoint }): php.Method {
        const endpointSignatureInfo = this.getEndpointSignatureInfo({ serviceId, endpoint });
        const parameters = [...endpointSignatureInfo.baseParameters];
        parameters.push(
            php.parameter({
                name: `$${this.context.getRequestOptionsName()}`,
                type: php.Type.optional(this.context.getRequestOptionsType())
            })
        );
        // TODO: Support deserializing the JSON response.
        //
        // const return_ = getEndpointReturnType({ context: this.context, endpoint });
        return php.method({
            name: this.context.getEndpointMethodName(endpoint),
            access: "public",
            parameters,
            docs: endpoint.docs,
            return_: php.Type.mixed(),
            body: php.codeblock((writer) => {
                const queryParameterCodeBlock = endpointSignatureInfo.request?.getQueryParameterCodeBlock();
                if (queryParameterCodeBlock != null) {
                    queryParameterCodeBlock.code.write(writer);
                }
                const headerParameterCodeBlock = endpointSignatureInfo.request?.getHeaderParameterCodeBlock();
                if (headerParameterCodeBlock != null) {
                    headerParameterCodeBlock.code.write(writer);
                }
                const requestBodyCodeBlock = endpointSignatureInfo.request?.getRequestBodyCodeBlock();
                if (requestBodyCodeBlock?.code != null) {
                    writer.writeNode(requestBodyCodeBlock.code);
                }

                writer.writeLine("try {");
                writer.indent();
                writer.write(`${RESPONSE_VARIABLE_NAME} = `);
                writer.writeNodeStatement(
                    this.context.rawClient.sendRequest({
                        clientReference: `$this->${this.context.rawClient.getFieldName()}`,
                        baseUrl: this.getBaseURLForEndpoint({ endpoint }),
                        endpoint,
                        bodyReference: requestBodyCodeBlock?.requestBodyReference,
                        pathParameterReferences: endpointSignatureInfo.pathParameterReferences,
                        headerBagReference: headerParameterCodeBlock?.headerParameterBagReference,
                        queryBagReference: queryParameterCodeBlock?.queryParameterBagReference
                    })
                );
                writer.writeTextStatement(`${STATUS_CODE_VARIABLE_NAME} = ${RESPONSE_VARIABLE_NAME}->getStatusCode()`);
                const successResponseStatements = this.getEndpointSuccessResponseStatements({ endpoint });
                if (successResponseStatements != null) {
                    writer.writeNode(successResponseStatements);
                }
                writer.dedent();
                writer.write("} catch (");
                writer.writeNode(this.context.getClientExceptionInterfaceClassReference());
                writer.writeLine(" $e) {");
                writer.indent();
                writer.write("throw new ");
                writer.writeNode(this.context.getBaseApiExceptionClassReference());
                writer.writeTextStatement("($e->getMessage())");
                writer.dedent();
                writer.writeLine("}");

                writer.writeNode(this.getEndpointErrorHandling({ endpoint }));
            })
        });
    }

    private getBaseURLForEndpoint({ endpoint }: { endpoint: HttpEndpoint }): php.CodeBlock {
        return php.codeblock((writer) => {
            const baseUrlOptionName = this.context.getBaseUrlOptionName();
            const requestOptionName = this.context.getRequestOptionsName();
            const defaultBaseUrl = this.context.getDefaultBaseUrlForEndpoint(endpoint);

            writer.write(`$this->${requestOptionName}['${baseUrlOptionName}'] ?? `);
            writer.writeNode(defaultBaseUrl);
        });
    }

    private getEndpointErrorHandling({ endpoint }: { endpoint: HttpEndpoint }): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.write("throw new ");
            writer.writeNode(this.context.getBaseApiExceptionClassReference());
            writer.writeTextStatement(`("Error with status code " . ${STATUS_CODE_VARIABLE_NAME})`);
        });
    }

    private getEndpointSuccessResponseStatements({ endpoint }: { endpoint: HttpEndpoint }): php.CodeBlock | undefined {
        if (endpoint.response?.body == null) {
            return php.codeblock((writer) => {
                writer.controlFlow(
                    "if",
                    php.codeblock(`${STATUS_CODE_VARIABLE_NAME} >= 200 && ${STATUS_CODE_VARIABLE_NAME} < 400`)
                );
                writer.writeLine("return;");
                writer.endControlFlow();
            });
        }
        const body = endpoint.response.body;
        return php.codeblock((writer) => {
            body._visit({
                streamParameter: () => this.context.logger.error("Stream parameters not supported"),
                fileDownload: () => this.context.logger.error("File download not supported"),
                json: (_reference) => {
                    // TODO: Deserialize the response body into the correct type.
                    //
                    // const astType = this.context.phpTypeMapper.convert({ reference: reference.responseBodyType });
                    writer.controlFlow(
                        "if",
                        php.codeblock(`${STATUS_CODE_VARIABLE_NAME} >= 200 && ${STATUS_CODE_VARIABLE_NAME} < 400`)
                    );
                    writer.writeTextStatement(
                        `return json_decode(${RESPONSE_VARIABLE_NAME}->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR)`
                    );
                    writer.endControlFlow();
                    writer.write("} catch (");
                    writer.writeNode(this.context.getJsonExceptionClassReference());
                    writer.writeLine(" $e) {");
                    writer.indent();
                    writer.write("throw new ");
                    writer.writeNode(this.context.getBaseExceptionClassReference());
                    writer.writeTextStatement('("Failed to deserialize response", 0, $e)');
                    writer.dedent();
                },
                streaming: () => this.context.logger.error("Streaming not supported"),
                text: () => {
                    writer.controlFlow(
                        "if",
                        php.codeblock(`${STATUS_CODE_VARIABLE_NAME} >= 200 && ${STATUS_CODE_VARIABLE_NAME} < 400`)
                    );
                    writer.writeTextStatement(`return ${RESPONSE_VARIABLE_NAME}->getBody()->getContents()`);
                    writer.endControlFlow();
                },
                _other: () => undefined
            });
        });
    }
}
