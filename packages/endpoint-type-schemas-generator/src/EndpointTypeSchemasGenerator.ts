import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedEndpointTypeSchemas } from "@fern-typescript/sdk-declaration-handler";
import { GeneratedEndpointTypeSchemasImpl } from "./GeneratedEndpointTypeSchemasImpl";

export declare namespace EndpointTypeSchemasGenerator {
    export interface Init {
        errorResolver: ErrorResolver;
    }

    export namespace generateEndpointTypeSchemas {
        export interface Args {
            service: HttpService;
            endpoint: HttpEndpoint;
        }
    }
}

export class EndpointTypeSchemasGenerator {
    private errorResolver: ErrorResolver;

    constructor({ errorResolver }: EndpointTypeSchemasGenerator.Init) {
        this.errorResolver = errorResolver;
    }

    public generateEndpointTypeSchemas({
        service,
        endpoint,
    }: EndpointTypeSchemasGenerator.generateEndpointTypeSchemas.Args): GeneratedEndpointTypeSchemas {
        return new GeneratedEndpointTypeSchemasImpl({ service, endpoint, errorResolver: this.errorResolver });
    }
}
