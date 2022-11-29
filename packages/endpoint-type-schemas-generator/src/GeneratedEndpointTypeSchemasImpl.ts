import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { EndpointTypeSchemasContext, GeneratedEndpointTypeSchemas } from "@fern-typescript/sdk-declaration-handler";
import { GeneratedEndpointErrorSchema } from "./GeneratedEndpointErrorSchema";
import { GeneratedTypeReferenceSchema } from "./GeneratedTypeReferenceSchema";

export declare namespace GeneratedEndpointTypeSchemasImpl {
    export interface Init {
        endpoint: HttpEndpoint;
        errorResolver: ErrorResolver;
    }
}

export class GeneratedEndpointTypeSchemasImpl implements GeneratedEndpointTypeSchemas {
    private static REQUEST_SCHEMA_NAME = "Request";
    private static RESPONSE_SCHEMA_NAME = "Response";

    private generatedRequestSchema: GeneratedTypeReferenceSchema | undefined;
    private generatedResponseSchema: GeneratedTypeReferenceSchema | undefined;
    private generatedErrorSchema: GeneratedEndpointErrorSchema;

    constructor({ endpoint, errorResolver }: GeneratedEndpointTypeSchemasImpl.Init) {
        this.generatedRequestSchema = GeneratedTypeReferenceSchema.of({
            typeName: GeneratedEndpointTypeSchemasImpl.REQUEST_SCHEMA_NAME,
            typeReference: endpoint.request.typeV2 ?? undefined,
        });
        this.generatedResponseSchema = GeneratedTypeReferenceSchema.of({
            typeName: GeneratedEndpointTypeSchemasImpl.RESPONSE_SCHEMA_NAME,
            typeReference: endpoint.response.typeV2 ?? undefined,
        });
        this.generatedErrorSchema = new GeneratedEndpointErrorSchema({ endpoint, errorResolver });
    }

    public writeToFile(context: EndpointTypeSchemasContext): void {
        this.generatedRequestSchema?.writeToFile(context);
        this.generatedResponseSchema?.writeToFile(context);
        this.generatedErrorSchema.writeToFile(context);
    }
}
