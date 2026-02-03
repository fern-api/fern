import { ast } from "@fern-api/csharp-codegen";
import { HttpEndpoint, SdkRequest, TypeReference } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { RawClient } from "../http/RawClient";
import {
    EndpointRequest,
    HeaderParameterCodeBlock,
    QueryParameterCodeBlock,
    RequestBodyCodeBlock
} from "./EndpointRequest";

export class ReferencedEndpointRequest extends EndpointRequest {
    private requestBodyShape: TypeReference;

    public constructor(
        context: SdkGeneratorContext,
        sdkRequest: SdkRequest,
        endpoint: HttpEndpoint,
        requestBodyShape: TypeReference
    ) {
        super(context, sdkRequest, endpoint);
        this.requestBodyShape = requestBodyShape;
    }

    public getParameterType(): ast.Type {
        return this.context.csharpTypeMapper.convert({
            reference: this.requestBodyShape
        });
    }

    public getQueryParameterCodeBlock(): QueryParameterCodeBlock | undefined {
        return undefined;
    }

    public getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined {
        const requestOptionsVar = this.endpoint.idempotent
            ? this.names.parameters.idempotentOptions
            : this.names.parameters.requestOptions;

        return {
            code: this.csharp.codeblock((writer) => {
                // Start with HeadersBuilder.Builder instance
                writer.write(
                    `var ${this.names.variables.headers} = await new ${this.namespaces.core}.HeadersBuilder.Builder()`
                );
                writer.indent();

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

    public getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined {
        return {
            requestBodyReference: this.getParameterName()
        };
    }

    public getRequestType(): RawClient.RequestBodyType | undefined {
        return "json";
    }
}
