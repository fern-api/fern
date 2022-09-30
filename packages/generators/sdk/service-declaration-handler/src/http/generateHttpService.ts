import { HttpService } from "@fern-fern/ir-model/services/http";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ServiceDeclarationHandler } from "../ServiceDeclarationHandler";
import { Client } from "./Client";
import { Endpoint } from "./endpoints/Endpoint";

export function generateHttpService({
    service,
    serviceClassName,
    serviceFile,
    withEndpoint,
}: {
    service: HttpService;
    serviceClassName: string;
    serviceFile: SdkFile;
    withEndpoint: (endpointId: string, run: (args: ServiceDeclarationHandler.withEndpoint.Args) => void) => void;
}): void {
    const client = new Client({ service, serviceClassName });
    const endpoints: Endpoint[] = [];

    for (const irEndpoint of service.endpoints) {
        withEndpoint(irEndpoint.id, ({ endpointFile, schemaFile }) => {
            const endpoint = new Endpoint({
                serviceName: service.name,
                endpoint: irEndpoint,
                file: endpointFile,
            });
            endpoint.generate({ endpointFile, schemaFile });
            endpoints.push(endpoint);
        });
    }

    client.generate(serviceFile, endpoints);
}
