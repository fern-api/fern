import { getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { ast, Writer } from "@fern-api/csharp-codegen";

import { FernIr } from "@fern-fern/ir-sdk";

type HttpEndpoint = FernIr.HttpEndpoint;
type QueryParameter = FernIr.QueryParameter;
type SdkRequest = FernIr.SdkRequest;
type SdkRequestWrapper = FernIr.SdkRequestWrapper;
type ServiceId = FernIr.ServiceId;
type TypeReference = FernIr.TypeReference;

import { fail } from "assert";
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
        serviceId: ServiceId;
        sdkRequest: SdkRequest;
        wrapper: SdkRequestWrapper;
        endpoint: HttpEndpoint;
    }
}

export class WrappedEndpointRequest extends EndpointRequest {
    private serviceId: ServiceId;
    private wrapper: SdkRequestWrapper;

    public constructor({ context, sdkRequest, serviceId, wrapper, endpoint }: WrappedEndpointRequest.Args) {
        super(context, sdkRequest, endpoint);
        this.serviceId = serviceId;
        this.wrapper = wrapper;
    }

    public getParameterType(): ast.Type {
        return this.context.getRequestWrapperReference(this.serviceId, this.wrapper);
    }

    public getQueryParameterCodeBlock(): QueryParameterCodeBlock | undefined {
        if (this.endpoint.queryParameters.length === 0) {
            return undefined;
        }

        // Use QueryStringBuilder.Builder fluent API for cleaner generated code
        // The builder handles null values automatically, so we can chain all parameters
        const queryStringVar = "_queryString";
        const requestOptionsVar = this.endpoint.idempotent
            ? this.names.parameters.idempotentOptions
            : this.names.parameters.requestOptions;

        return {
            code: this.csharp.codeblock((writer) => {
                writer.write(
                    `var ${queryStringVar} = new ${this.namespaces.qualifiedCore}.QueryStringBuilder.Builder(capacity: ${this.endpoint.queryParameters.length})`
                );
                writer.indent();
                for (const query of this.endpoint.queryParameters) {
                    writer.writeLine();
                    this.writeQueryParameterBuilderCallChained(writer, query);
                }
                writer.dedent();
                writer.writeLine();
                writer.write(`.MergeAdditional(${requestOptionsVar}?.AdditionalQueryParameters)`);
                writer.writeLine();
                writer.write(".Build();");
            }),
            queryStringReference: queryStringVar
        };
    }

    /**
     * Writes a chained fluent builder method call for a query parameter.
     * Uses Add() for primitives and AddDeepObject() for complex types.
     * The builder automatically handles null values, so no conditional checks are needed.
     */
    private writeQueryParameterBuilderCallChained(writer: Writer, query: QueryParameter): void {
        const baseReference = `${this.getParameterName()}.${this.case.pascalSafe(query.name)}`;

        // When experimental explicit nullable/optional is enabled, Optional<T> types need special handling
        // since QueryStringBuilder doesn't know how to serialize Optional<T> objects directly
        // Note: Multi-value query parameters (allowMultiple=true) are always generated as IEnumerable<T>,
        // never as Optional<T>, so they should never use Optional handling regardless of IR type
        const queryParameterReference =
            this.context.generation.settings.enableExplicitNullableOptional &&
            !query.allowMultiple &&
            this.isOptionalType(query.valueType)
                ? `${baseReference}.IsDefined ? ${baseReference}.Value : null`
                : baseReference;

        const isComplexType = this.isComplexType(query.valueType);

        if (isComplexType) {
            writer.write(`.AddDeepObject("${getWireValue(query.name)}", ${queryParameterReference})`);
        } else {
            writer.write(`.Add("${getWireValue(query.name)}", ${queryParameterReference})`);
        }
    }

    /**
     * Determines if a type reference represents an Optional<T> wrapper type.
     * This only returns true for optional<nullable<T>> patterns that generate as Optional<T?>
     * when enableExplicitNullableOptional is enabled.
     */
    private isOptionalType(typeReference: TypeReference): boolean {
        return typeReference._visit({
            container: (container) => {
                if (container.type !== "optional") {
                    return false;
                }
                return container.optional._visit({
                    container: (innerContainer) => innerContainer.type === "nullable",
                    named: () => false,
                    primitive: () => false,
                    unknown: () => false,
                    _other: () => false
                });
            },
            named: () => false,
            primitive: () => false,
            unknown: () => false,
            _other: () => false
        });
    }

    /**
     * Determines if a type reference represents a complex type (object/named type)
     * that should use AddDeepObject for query string serialization.
     * Returns false for primitives, collections, and aliases to non-object types.
     */
    private isComplexType(typeReference: TypeReference): boolean {
        return typeReference._visit({
            container: (container) => {
                // For optional types, check the inner type
                if (container.type === "optional") {
                    return this.isComplexType(container.optional);
                }
                if (container.type === "nullable") {
                    return this.isComplexType(container.nullable);
                }
                // Lists, maps, sets are not deep objects
                return false;
            },
            named: (namedType) => {
                // Check if this named type is actually an object type (not an alias to primitive/collection)
                const typeDeclaration = this.context.model.dereferenceType(namedType.typeId).typeDeclaration;
                const shapeType = typeDeclaration.shape.type;

                // Only true objects and unions should use AddDeepObject
                if (shapeType === "object" || shapeType === "union" || shapeType === "undiscriminatedUnion") {
                    return true;
                }

                // For aliases, check the aliased type recursively
                if (shapeType === "alias") {
                    return this.isComplexType(typeDeclaration.shape.aliasOf);
                }

                // Enums and other types are not complex
                return false;
            },
            primitive: () => false,
            unknown: () => false,
            _other: () => false
        });
    }

    public getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined {
        const service =
            this.context.getHttpService(this.serviceId) ?? fail(`Service with id ${this.serviceId} not found`);
        const headers = [...service.headers, ...this.endpoint.headers];

        const requestOptionsVar = this.endpoint.idempotent
            ? this.names.parameters.idempotentOptions
            : this.names.parameters.requestOptions;

        return {
            code: this.csharp.codeblock((writer) => {
                // Start with HeadersBuilder.Builder instance
                writer.write(
                    `var ${this.names.variables.headers} = await new ${this.namespaces.qualifiedCore}.HeadersBuilder.Builder()`
                );
                writer.indent();

                // Add all endpoint-specific headers (required, optional, and nullable) using fluent API
                // The Add method handles null values and serialization automatically
                for (const header of headers) {
                    writer.writeLine();
                    const headerReference = `${this.getParameterName()}.${this.case.pascalSafe(header.name)}`;
                    writer.write(`.Add("${getWireValue(header.name)}", ${headerReference})`);
                }

                // Add client-level headers (from root client constructor)
                writer.writeLine();
                writer.write(".Add(_client.Options.Headers)");

                // Add client-level additional headers
                writer.writeLine();
                writer.write(".Add(_client.Options.AdditionalHeaders)");

                // For idempotent requests, add idempotency headers (as Dictionary<string, string>)
                if (this.endpoint.idempotent) {
                    writer.writeLine();
                    writer.write(
                        `.Add(((${this.Types.IdempotentRequestOptionsInterface.name}?)${requestOptionsVar})?.GetIdempotencyHeaders())`
                    );
                }

                // Add request options additional headers (highest priority)
                writer.writeLine();
                writer.write(`.Add(${requestOptionsVar}?.AdditionalHeaders)`);

                // Build the final Headers instance asynchronously
                writer.writeLine();
                writer.write(".BuildAsync()");

                // Add ConfigureAwait at the very end
                writer.writeLine();
                writer.write(".ConfigureAwait(false);");

                writer.dedent();
            }),
            headerParameterBagReference: this.names.variables.headers
        };
    }

    public getRequestType(): RawClient.RequestBodyType | undefined {
        if (this.endpoint.requestBody == null) {
            return undefined;
        }
        switch (this.endpoint.requestBody.type) {
            case "bytes":
                return "bytes";
            case "reference":
            case "inlinedRequestBody":
                switch (this.endpoint.requestBody.contentType) {
                    case "application/x-www-form-urlencoded":
                        return "urlencoded";
                    default:
                        return "json";
                }
            case "fileUpload":
                return "multipartform";
            default:
                assertNever(this.endpoint.requestBody);
        }
    }

    public getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined {
        if (this.endpoint.requestBody == null) {
            return undefined;
        }
        return this.endpoint.requestBody._visit({
            reference: () => {
                return {
                    requestBodyReference: `${this.getParameterName()}.${this.case.pascalSafe(this.wrapper.bodyKey)}`
                };
            },
            inlinedRequestBody: () => {
                return {
                    requestBodyReference: this.getParameterName()
                };
            },
            fileUpload: () => undefined,
            bytes: () => {
                return {
                    requestBodyReference: `${this.getParameterName()}.${this.case.pascalSafe(this.wrapper.bodyKey)}`
                };
            },
            _other: () => undefined
        });
    }
}
