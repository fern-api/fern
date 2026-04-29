import { GeneratorError, getOriginalName, getWireValue } from "@fern-api/base-generator";
import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";

import { DefaultValueExtractor } from "../../DefaultValueExtractor.js";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { RawClient } from "../http/RawClient.js";
import {
    EndpointRequest,
    HeaderParameterCodeBlock,
    QueryParameterCodeBlock,
    RequestBodyCodeBlock
} from "./EndpointRequest.js";

export declare namespace WrappedEndpointRequest {
    interface Args {
        context: SdkGeneratorContext;
        serviceId: FernIr.ServiceId;
        sdkRequest: FernIr.SdkRequest;
        wrapper: FernIr.SdkRequestWrapper;
        endpoint: FernIr.HttpEndpoint;
    }
}

const BODY_BAG_NAME = "body_params";
const QUERY_PARAM_NAMES_VN = "query_param_names";
const PATH_PARAM_NAMES_VN = "path_param_names";
const HEADER_BAG_NAME = "headers";

export class WrappedEndpointRequest extends EndpointRequest {
    private serviceId: FernIr.ServiceId;
    private wrapper: FernIr.SdkRequestWrapper;

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

        const defaultExtractor = new DefaultValueExtractor(this.context);

        const hasRequestBody = this.endpoint.requestBody != null;

        // When the body is built via request_data.except(*non_body_param_names), the body
        // code block already handles excluding non-body params, so stripping query params
        // from `params` would be a useless assignment (Lint/UselessAssignment).
        const bodyHandlesParamExclusion =
            hasRequestBody &&
            this.endpoint.requestBody?.type === "inlinedRequestBody" &&
            this.getNonBodyParameterWireNames().length > 0;

        const needsParamsExcept = hasRequestBody && !bodyHandlesParamExclusion;

        return {
            code: ruby.codeblock((writer) => {
                if (needsParamsExcept) {
                    writer.write(`${QUERY_PARAM_NAMES_VN} = `);
                    writer.writeLine(`${toRubySymbolArray(this.getQueryParameterNames())}`);
                }
                writer.writeLine(`${queryParameterBagName} = {}`);
                for (const queryParam of this.endpoint.queryParameters) {
                    const snakeCaseName = this.case.snakeSafe(queryParam.name);
                    const wireValue = getWireValue(queryParam.name);

                    // clientDefault always applies; type-level defaults only when config is on
                    const clientDefault = defaultExtractor.extractClientDefault(queryParam.clientDefault);
                    const typeDefault =
                        this.context.customConfig.useDefaultRequestParameterValues && !queryParam.allowMultiple
                            ? defaultExtractor.extractDefault(queryParam.valueType)
                            : undefined;
                    const effectiveDefault = clientDefault ?? typeDefault?.value;

                    if (effectiveDefault != null) {
                        writer.writeLine(
                            `${queryParameterBagName}["${wireValue}"] = params.fetch(:${snakeCaseName}, ${effectiveDefault})`
                        );
                    } else {
                        writer.writeLine(
                            `${queryParameterBagName}["${wireValue}"] = params[:${snakeCaseName}] if params.key?(:${snakeCaseName})`
                        );
                    }
                }
                if (needsParamsExcept) {
                    writer.writeLine(`params = params.except(*${QUERY_PARAM_NAMES_VN})`);
                }
            }),
            queryParameterBagReference: queryParameterBagName
        };
    }

    public getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined {
        if (this.endpoint.headers.length === 0) {
            return undefined;
        }

        const defaultExtractor = new DefaultValueExtractor(this.context);

        return {
            code: ruby.codeblock((writer) => {
                writer.writeLine(`${HEADER_BAG_NAME} = {}`);
                for (const header of this.endpoint.headers) {
                    const snakeCaseName = this.case.snakeSafe(header.name);
                    const wireValue = getWireValue(header.name);

                    // clientDefault always applies; type-level defaults only when config is on
                    const clientDefault = defaultExtractor.extractClientDefault(header.clientDefault);
                    const typeDefault = this.context.customConfig.useDefaultRequestParameterValues
                        ? defaultExtractor.extractDefault(header.valueType)
                        : undefined;
                    const effectiveDefault = clientDefault ?? typeDefault?.value;

                    if (effectiveDefault != null) {
                        writer.writeLine(
                            `${HEADER_BAG_NAME}["${wireValue}"] = params.fetch(:${snakeCaseName}, ${effectiveDefault})`
                        );
                    } else {
                        writer.writeLine(
                            `${HEADER_BAG_NAME}["${wireValue}"] = params[:${snakeCaseName}] if params[:${snakeCaseName}]`
                        );
                    }
                }
            }),
            headerParameterBagReference: HEADER_BAG_NAME
        };
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
            const typeDeclaration = this.context.getTypeDeclarationOrThrow(
                this.endpoint.requestBody.requestBodyType.typeId
            );
            // Enums and aliases are modules, not classes, so they don't have a .new() method
            const isModule = typeDeclaration.shape.type === "enum" || typeDeclaration.shape.type === "alias";

            if (this.hasPathParameters()) {
                return {
                    code: ruby.codeblock((writer) => {
                        writer.writeLine(`${PATH_PARAM_NAMES_VN} = ${toRubySymbolArray(this.getPathParameterNames())}`);
                        writer.writeLine(`${BODY_BAG_NAME} = params.except(*${PATH_PARAM_NAMES_VN})`);
                    }),
                    requestBodyReference: ruby.codeblock((writer) => {
                        if (isModule) {
                            writer.write(bodyParamsVar);
                        } else {
                            writer.writeNode(bodyTypeReference);
                            writer.write(`.new(${bodyParamsVar}).to_h`);
                        }
                    })
                };
            }
            return {
                requestBodyReference: ruby.codeblock((writer) => {
                    if (isModule) {
                        writer.write(bodyParamsVar);
                    } else {
                        writer.writeNode(bodyTypeReference);
                        writer.write(`.new(${bodyParamsVar}).to_h`);
                    }
                })
            };
        }

        if (this.endpoint.requestBody.type === "inlinedRequestBody") {
            const wrapperReference = this.context.getRequestWrapperReference(this.serviceId, this.wrapper.wrapperName);

            // Get all non-body parameter names (path, query, headers) that need to be excluded from the body
            const nonBodyParamNames = this.getNonBodyParameterWireNames();

            if (nonBodyParamNames.length > 0) {
                // Fix for request body serialization bug:
                // Instead of removing path/query params before serialization (which causes nil values
                // to be serialized for required fields), we serialize ALL params through the wrapper
                // type first, then remove the non-body params from the serialized result.
                const NON_BODY_PARAM_NAMES_VN = "non_body_param_names";
                return {
                    code: ruby.codeblock((writer) => {
                        writer.write(`request_data = `);
                        writer.writeNode(wrapperReference);
                        writer.writeLine(`.new(params).to_h`);
                        writer.writeLine(`${NON_BODY_PARAM_NAMES_VN} = ${toExplicitArray(nonBodyParamNames)}`);
                        writer.writeLine(`body = request_data.except(*${NON_BODY_PARAM_NAMES_VN})`);
                    }),
                    requestBodyReference: ruby.codeblock("body")
                };
            }
            return {
                requestBodyReference: ruby.codeblock((writer) => {
                    writer.writeNode(wrapperReference);
                    writer.write(`.new(params).to_h`);
                })
            };
        }

        // Fallback case: if there are path parameters, we need to define _body
        if (this.hasPathParameters()) {
            return {
                code: ruby.codeblock((writer) => {
                    writer.writeLine(`${PATH_PARAM_NAMES_VN} = ${toRubySymbolArray(this.getPathParameterNames())}`);
                    writer.writeLine(`${BODY_BAG_NAME} = params.except(*${PATH_PARAM_NAMES_VN})`);
                }),
                requestBodyReference: ruby.codeblock((writer) => {
                    writer.write(BODY_BAG_NAME);
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
        return this.endpoint.allPathParameters.map((pathParameter) => this.case.snakeSafe(pathParameter.name));
    }

    private getQueryParameterNames(): string[] {
        return this.endpoint.queryParameters.map((queryParameter) => this.case.snakeSafe(queryParameter.name));
    }

    private hasPathParameters(): boolean {
        return this.endpoint.allPathParameters.length > 0;
    }

    private hasQueryParameters(): boolean {
        return this.endpoint.queryParameters.length > 0;
    }

    /**
     * Returns the wire names of all non-body parameters (path, query, headers).
     * These are the keys that will appear in the serialized hash and need to be
     * excluded from the request body.
     */
    private getNonBodyParameterWireNames(): string[] {
        const wireNames: string[] = [];

        // Path parameters use originalName as wireValue
        for (const pathParam of this.endpoint.allPathParameters) {
            wireNames.push(getOriginalName(pathParam.name));
        }

        // Query parameters have explicit wireValue
        for (const queryParam of this.endpoint.queryParameters) {
            wireNames.push(getWireValue(queryParam.name));
        }

        // Headers have explicit wireValue
        for (const header of this.endpoint.headers) {
            wireNames.push(getWireValue(header.name));
        }

        return wireNames;
    }
}

function toExplicitArray(s: string[]): string {
    if (s.every((item) => /^[^\s\]\\]+$/.test(item))) {
        return `%w[${s.join(" ")}]`;
    }
    return `["${s.join('", "')}"]`;
}

function toRubySymbolArray(s: string[]): string {
    if (s.some((s) => s.includes(" "))) {
        throw GeneratorError.internalError("Symbol array cannot contain spaces");
    }
    return `%i[${s.join(" ")}]`;
}
