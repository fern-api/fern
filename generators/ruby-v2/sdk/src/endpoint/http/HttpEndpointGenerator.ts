import { ruby } from "@fern-api/ruby-ast";
import { HttpEndpoint, PathParameter, QueryParameter, ServiceId, TypeReference } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { getEndpointRequest } from "../utils/getEndpointRequest";
import { getEndpointReturnType } from "../utils/getEndpointReturnType";
import { RAW_CLIENT_REQUEST_VARIABLE_NAME, RawClient } from "./RawClient";

export declare namespace HttpEndpointGenerator {
    export interface GenerateArgs {
        endpoint: HttpEndpoint;
        serviceId: ServiceId;
    }
}

export const HTTP_RESPONSE_VN = "_response";
export const PATH_PARAMS_VN = "_path_params";
export const QUERY_PARAMS_VN = "_query_params";
export const PARAMS_VN = "params";

export class HttpEndpointGenerator {
    private context: SdkGeneratorContext;

    public constructor({ context }: { context: SdkGeneratorContext }) {
        this.context = context;
    }

    public generate({ endpoint, serviceId }: HttpEndpointGenerator.GenerateArgs): ruby.Method[] {
        return [this.generateUnpagedMethod({ endpoint, serviceId })];
    }

    private generateUnpagedMethod({
        endpoint,
        serviceId
    }: {
        endpoint: HttpEndpoint;
        serviceId: ServiceId;
    }): ruby.Method {
        const rawClient = new RawClient(this.context);

        const returnType = getEndpointReturnType({ context: this.context, endpoint });

        const request = getEndpointRequest({
            context: this.context,
            endpoint,
            serviceId
        });

        const statements: ruby.AstNode[] = [];

        if (endpoint.allPathParameters.length > 0) {
            const pathParameterNames = endpoint.allPathParameters.map((pathParameter) =>
                this.getPathParameterName({ pathParameter })
            );
            statements.push(ruby.codeblock((writer) => {
                writer.writeLine(`_path_param_names = ["${pathParameterNames.join(`", "`)}"]`);
                writer.writeLine(`${PATH_PARAMS_VN} = ${PARAMS_VN}.extract!(*_path_param_names)`);
            }));
        }

        if (endpoint.queryParameters.length > 0) {
            const queryParameterNames = endpoint.queryParameters.map((queryParameter) =>
                this.getQueryParameterName({ queryParameter })
            );
            statements.push(ruby.codeblock((writer) => {
                writer.writeLine(`_query_param_names = ["${queryParameterNames.join(`", "`)}"]`);
                writer.writeLine(`${QUERY_PARAMS_VN} = ${PARAMS_VN}.extract!(*_query_param_names)`);
            }));
        }

        const pathParameterReferences = this.getPathParameterReferences({ endpoint });
        const sendRequestCodeBlock = rawClient.sendRequest({
            baseUrl: ruby.codeblock(""),
            pathParameterReferences,
            endpoint,
            requestType: request?.getRequestType(),
            queryBagReference: endpoint.queryParameters.length > 0 ? QUERY_PARAMS_VN : undefined,
            bodyReference: request?.getRequestBodyCodeBlock()?.requestBodyReference
        });

        if (sendRequestCodeBlock != null) {
            statements.push(sendRequestCodeBlock);
        } else {
            statements.push(
                ruby.codeblock((writer) => {
                    writer.write(`_request = ${PARAMS_VN}`);
                })
            );
        }

        statements.push(
            ruby.codeblock(`${HTTP_RESPONSE_VN} = @client.send(${RAW_CLIENT_REQUEST_VARIABLE_NAME})`),
            ruby.ifElse({
                if: {
                    condition: ruby.codeblock(
                        `${HTTP_RESPONSE_VN}.code >= "200" && ${HTTP_RESPONSE_VN}.code < "300"`
                    ),
                    thenBody: [
                        ruby.codeblock((writer) => {
                            if (endpoint.response?.body == null) {
                                writer.writeLine(`return`);
                            } else {
                                switch (endpoint.response.body.type) {
                                    case "json":
                                        writer.write(`return `);
                                        this.loadResponseBodyFromJson({
                                            writer,
                                            typeReference: endpoint.response.body.value.responseBodyType
                                        });
                                        break;
                                    default:
                                        break;
                                }
                            }
                        })
                    ]
                },
                elseBody: ruby.codeblock((writer) => {
                    writer.writeLine(`raise ${HTTP_RESPONSE_VN}.body`);
                })
            })
        );

        return ruby.method({
            name: endpoint.name.snakeCase.safeName,
            docstring: endpoint.docs,
            returnType,
            parameters: {
                keyword: [
                    ruby.parameters.keyword({
                        name: "request_options",
                        initializer: ruby.TypeLiteral.hash([])
                    })
                ],
                keywordSplat: ruby.parameters.keywordSplat({
                    name: PARAMS_VN
                })
            },
            statements
        });
    }

    private getQueryParameterReferences({ endpoint }: { endpoint: HttpEndpoint }): Record<string, string> {
        const queryParameterReferences: Record<string, string> = {};
        for (const queryParam of endpoint.queryParameters) {
            const parameterName = queryParam.name.name.originalName;
            queryParameterReferences[queryParam.name.name.originalName] = `params[:${parameterName}]`;
        }
        return queryParameterReferences;
    }

    private getQueryParameterName({ queryParameter }: { queryParameter: QueryParameter }): string {
        return queryParameter.name.name.originalName;
    }

    private getPathParameterReferences({ endpoint }: { endpoint: HttpEndpoint }): Record<string, string> {
        const pathParameterReferences: Record<string, string> = {};
        for (const pathParam of endpoint.allPathParameters) {
            const parameterName = this.getPathParameterName({
                pathParameter: pathParam
            });
            pathParameterReferences[pathParam.name.originalName] = `${PATH_PARAMS_VN}[:${parameterName}]`;
        }
        return pathParameterReferences;
    }

    private getPathParameterName({ pathParameter }: { pathParameter: PathParameter }): string {
        return pathParameter.name.originalName;
    }

    private loadResponseBodyFromJson({
        writer,
        typeReference
    }: {
        writer: ruby.Writer;
        typeReference: TypeReference;
    }): void {
        switch (typeReference.type) {
            case "named":
                writer.writeLine(
                    `${this.context.getReferenceToTypeId(typeReference.typeId)}.load(${HTTP_RESPONSE_VN}.body)`
                );
                break;
            default:
                break;
        }
    }
}
