import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";

export class IrBuilder {
    private displayName: string | undefined = undefined;
    private servers: FernOpenapiIr.Server[] = [];
    private endpoints: FernOpenapiIr.Endpoint[] = [];
    private schemas: Record<FernOpenapiIr.SchemaId, FernOpenapiIr.Schema> = {};

    public setDisplayName(displayName: string): void {
        this.displayName = displayName;
    }

    public addServer(server: FernOpenapiIr.Server): void {
        this.servers.push(server);
    }

    public addEndpoint(endpoint: FernOpenapiIr.Endpoint): void {
        this.endpoints.push(endpoint);
    }

    public addSchema(schemaId: string, schema: FernOpenapiIr.Schema): void {
        this.schemas[schemaId] = schema;
    }

    public build(): FernOpenapiIr.IntermediateRepresentation {
        return {
            displayName: this.displayName,
            servers: this.servers,
            endpoints: this.endpoints,
            schemas: this.schemas,
        };
    }
}
