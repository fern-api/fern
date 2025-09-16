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

const QUERY_PARAMETER_BAG_NAME = "_query";
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
        return ruby.Type.void();
    }

    public getQueryParameterCodeBlock(): QueryParameterCodeBlock | undefined {
        if (this.endpoint.queryParameters.length === 0) {
            return undefined;
        }

        return {
            code: ruby.codeblock((writer) => {
                writer.writeLine(`${QUERY_PARAM_NAMES_VN} = [`);
                writer.indent();
                writer.writeLine(`${toExplicitArray(this.getQueryParameterNames())},`);
                writer.writeLine(`${toRubySymbolArray(this.getQueryParameterNames())}`);
                writer.dedent();
                writer.writeLine(`].flatten`);
                writer.writeLine(`${QUERY_PARAMETER_BAG_NAME} = params.slice(*${QUERY_PARAM_NAMES_VN})`);
                writer.writeLine(`params = params.except(*${QUERY_PARAM_NAMES_VN})`);
            }),
            queryParameterBagReference: QUERY_PARAMETER_BAG_NAME
        };
    }

    public getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined {
        return undefined;
    }

    public getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined {
        if (this.endpoint.requestBody == null) {
            return undefined;
        }
        if (this.hasPathParameters()) {
            return {
                code: ruby.codeblock((writer) => {
                    writer.writeLine(`${PATH_PARAM_NAMES_VN} = ${toExplicitArray(this.getPathParameterNames())}`);
                }),
                requestBodyReference: ruby.codeblock((writer) => {
                    writer.write(`params.except(*${PATH_PARAM_NAMES_VN})`);
                })
            };
        }
        return {
            requestBodyReference: ruby.codeblock((writer) => {
                writer.write("params");
            })
        };
    }

    public getRequestType(): RawClient.RequestBodyType | undefined {
        return "json";
    }

    private getPathParameterNames(): string[] {
        return this.endpoint.allPathParameters.map((pathParameter) => pathParameter.name.originalName);
    }

    private getQueryParameterNames(): string[] {
        return this.endpoint.queryParameters.map((queryParameter) => queryParameter.name.name.originalName);
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
