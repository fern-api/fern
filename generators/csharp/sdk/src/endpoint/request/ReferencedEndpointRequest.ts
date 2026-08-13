import { ast } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

type HttpEndpoint = FernIr.HttpEndpoint;
type SdkRequest = FernIr.SdkRequest;
type TypeReference = FernIr.TypeReference;
type ServiceId = FernIr.ServiceId;

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { mayOmitRequestBody } from "../../utils/requestBodyUtils.js";
import { RawClient } from "../http/RawClient.js";
import {
    EndpointRequest,
    HeaderParameterCodeBlock,
    QueryParameterCodeBlock,
    RequestBodyCodeBlock
} from "./EndpointRequest.js";
import { writeEndpointAuthHeaderAdd } from "./endpointAuthHeaders.js";
import { writeLiteralHeaders } from "./literalHeaders.js";

export class ReferencedEndpointRequest extends EndpointRequest {
    private requestBodyShape: TypeReference;

    public constructor(
        context: SdkGeneratorContext,
        sdkRequest: SdkRequest,
        endpoint: HttpEndpoint,
        requestBodyShape: TypeReference,
        private readonly serviceId: ServiceId
    ) {
        super(context, sdkRequest, endpoint);
        this.requestBodyShape = requestBodyShape;
    }

    public getParameterType(): ast.Type {
        const type = this.context.csharpTypeMapper.convert({
            reference: this.requestBodyShape
        });
        return this.mayBeOmitted() ? type.asOptional() : type;
    }

    public override getParameterInitializer(): string | undefined {
        return this.mayBeOmitted() ? "null" : undefined;
    }

    private mayBeOmitted(): boolean {
        return mayOmitRequestBody(this.context, this.endpoint.requestBody);
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
                    `var ${this.names.variables.headers} = await new ${this.namespaces.qualifiedCore}.HeadersBuilder.Builder()`
                );
                writer.indent();

                // Add literal service- and endpoint-level headers (no request object carries them)
                writeLiteralHeaders({
                    writer,
                    context: this.context,
                    serviceId: this.serviceId,
                    endpoint: this.endpoint
                });

                // Add client-level headers (from root client constructor)
                writer.writeLine();
                writer.write(".Add(_client.Options.Headers)");

                // In endpoint-security mode, route this endpoint's declared auth scheme(s) here.
                writeEndpointAuthHeaderAdd({ writer, context: this.context, endpoint: this.endpoint });

                // Add client-level additional headers
                writer.writeLine();
                writer.write(".Add(_client.Options.AdditionalHeaders)");

                // Fallback auto-generated idempotency-key header for the eligible HTTP methods carried
                // in the IR. Emitted before the declared idempotency headers and request-option headers
                // so a caller-provided value wins.
                if (this.context.shouldAutoGenerateIdempotencyKey(this.endpoint)) {
                    writer.writeLine();
                    writer.write(".AddIdempotencyHeader()");
                }

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
        if (this.endpoint.requestBody?.contentType === "application/x-www-form-urlencoded") {
            return "urlencoded";
        }
        return "json";
    }
}
