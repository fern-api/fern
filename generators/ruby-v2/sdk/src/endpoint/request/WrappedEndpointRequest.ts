import { ruby } from "@fern-api/ruby-ast";

import { HttpEndpoint, SdkRequest, SdkRequestWrapper, ServiceId } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { RawClient } from "../http/RawClient";
import {
    EndpointRequest,
    HeaderParameterCodeBlock,
    QueryParameterCodeBlock,
    RequestBodyCodeBlock
} from "./EndpointRequest";

export declare namespace WrappedEndpointRequest {
    interface Args {
        context: SdkGeneratorContext;
        serviceId: ServiceId;
        sdkRequest: SdkRequest;
        wrapper: SdkRequestWrapper;
        endpoint: HttpEndpoint;
    }
}

const BODY_BAG_NAME = "_body";
const QUERY_PARAM_NAMES_VN = "_query_param_names";
const PATH_PARAM_NAMES_VN = "_path_param_names";

export class WrappedEndpointRequest extends EndpointRequest {
    private serviceId: ServiceId;
    private wrapper: SdkRequestWrapper;

    public constructor({ context, sdkRequest, serviceId, wrapper, endpoint }: WrappedEndpointRequest.Args) {
        super(context, sdkRequest, endpoint);
        this.serviceId = serviceId;
        this.wrapper = wrapper;
    }

    public getParameterType(): ruby.Type {
        if (this.endpoint.requestBody?.type === "inlinedRequestBody") {
            const wrapperRef = this.context.getRequestWrapperReference(this.serviceId, this.wrapper.wrapperName);
            return ruby.Type.class_({ name: wrapperRef.name, modules: wrapperRef.modules });
        }
        if (
            this.endpoint.requestBody?.type === "reference" &&
            this.endpoint.requestBody.requestBodyType.type === "named"
        ) {
            const bodyTypeRef = this.context.getReferenceToTypeId(this.endpoint.requestBody.requestBodyType.typeId);
            return ruby.Type.class_({ name: bodyTypeRef.name, modules: bodyTypeRef.modules });
        }
        return ruby.Type.hash(ruby.Type.untyped(), ruby.Type.untyped());
    }

    public getQueryParameterCodeBlock(queryParameterBagName: string): QueryParameterCodeBlock | undefined {
        if (this.endpoint.queryParameters.length === 0) {
            return undefined;
        }

        return {
            code: ruby.codeblock((writer) => {
                writer.write(`params = `);
                ruby.invokeMethod({
                    on: ruby.classReference({
                        name: "Utils",
                        modules: [this.context.getRootModuleName(), "Internal", "Types"]
                    }),
                    method: "symbolize_keys",
                    arguments_: [ruby.codeblock("params")]
                }).write(writer);
                writer.newLine();
                writer.write(`${QUERY_PARAM_NAMES_VN} = `);
                writer.writeLine(`${toRubySymbolArray(this.getQueryParameterNames())}`);
                writer.writeLine(`${queryParameterBagName} = {}`);
                for (const queryParam of this.endpoint.queryParameters) {
                    const snakeCaseName = queryParam.name.name.snakeCase.safeName;
                    const wireValue = queryParam.name.wireValue;
                    writer.writeLine(
                        `${queryParameterBagName}["${wireValue}"] = params[:${snakeCaseName}] if params.key?(:${snakeCaseName})`
                    );
                }
                writer.writeLine(`params = params.except(*${QUERY_PARAM_NAMES_VN})`);
            }),
            queryParameterBagReference: queryParameterBagName
        };
    }

    public getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined {
        return undefined;
    }

    public getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined {
        if (this.endpoint.requestBody == null) {
            return undefined;
        }

        const bodyParamsVar = this.hasPathParameters() ? BODY_BAG_NAME : "params";

        if (
            this.endpoint.requestBody.type === "reference" &&
            this.endpoint.requestBody.requestBodyType.type === "named"
        ) {
            const bodyTypeReference = this.context.getReferenceToTypeId(
                this.endpoint.requestBody.requestBodyType.typeId
            );

            if (this.hasPathParameters()) {
                return {
                    code: ruby.codeblock((writer) => {
                        writer.writeLine(`${PATH_PARAM_NAMES_VN} = ${toRubySymbolArray(this.getPathParameterNames())}`);
                        writer.writeLine(`${BODY_BAG_NAME} = params.except(*${PATH_PARAM_NAMES_VN})`);
                    }),
                    requestBodyReference: ruby.codeblock((writer) => {
                        writer.writeNode(bodyTypeReference);
                        writer.write(`.new(${bodyParamsVar}).to_h`);
                    })
                };
            }
            return {
                requestBodyReference: ruby.codeblock((writer) => {
                    writer.writeNode(bodyTypeReference);
                    writer.write(`.new(${bodyParamsVar}).to_h`);
                })
            };
        }

        if (this.endpoint.requestBody.type === "inlinedRequestBody") {
            const wrapperReference = this.context.getRequestWrapperReference(this.serviceId, this.wrapper.wrapperName);
            const bodyPropertyNames = [
                ...this.endpoint.requestBody.properties,
                ...(this.endpoint.requestBody.extendedProperties ?? [])
            ].map((prop) => prop.name.name.snakeCase.safeName);

            const BODY_PROP_NAMES_VN = "_body_prop_names";

            if (this.hasPathParameters()) {
                return {
                    code: ruby.codeblock((writer) => {
                        writer.writeLine(`${PATH_PARAM_NAMES_VN} = ${toRubySymbolArray(this.getPathParameterNames())}`);
                        writer.writeLine(`${BODY_BAG_NAME} = params.except(*${PATH_PARAM_NAMES_VN})`);
                        writer.writeLine(`${BODY_PROP_NAMES_VN} = ${toRubySymbolArray(bodyPropertyNames)}`);
                        writer.writeLine(`_body_bag = ${BODY_BAG_NAME}.slice(*${BODY_PROP_NAMES_VN})`);
                    }),
                    requestBodyReference: ruby.codeblock((writer) => {
                        writer.writeNode(wrapperReference);
                        writer.write(`.new(_body_bag).to_h`);
                    })
                };
            }
            return {
                code: ruby.codeblock((writer) => {
                    writer.writeLine(`${BODY_PROP_NAMES_VN} = ${toRubySymbolArray(bodyPropertyNames)}`);
                    writer.writeLine(`_body_bag = params.slice(*${BODY_PROP_NAMES_VN})`);
                }),
                requestBodyReference: ruby.codeblock((writer) => {
                    writer.writeNode(wrapperReference);
                    writer.write(`.new(_body_bag).to_h`);
                })
            };
        }

        return {
            requestBodyReference: ruby.codeblock((writer) => {
                writer.write(bodyParamsVar);
            })
        };
    }

    public getRequestType(): RawClient.RequestBodyType | undefined {
        return "json";
    }

    private getPathParameterNames(): string[] {
        return this.endpoint.allPathParameters.map((pathParameter) => pathParameter.name.snakeCase.safeName);
    }

    private getQueryParameterNames(): string[] {
        return this.endpoint.queryParameters.map((queryParameter) => queryParameter.name.name.snakeCase.safeName);
    }

    private hasPathParameters(): boolean {
        return this.endpoint.allPathParameters.length > 0;
    }

    private hasQueryParameters(): boolean {
        return this.endpoint.queryParameters.length > 0;
    }
}

function toExplicitArray(s: string[]): string {
    return `["${s.join('", "')}"]`;
}

function toRubySymbolArray(s: string[]): string {
    if (s.some((s) => s.includes(" "))) {
        throw new Error("Symbol array cannot contain spaces");
    }
    return `%i[${s.join(" ")}]`;
}
