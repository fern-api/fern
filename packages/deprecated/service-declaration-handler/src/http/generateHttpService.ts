import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { AugmentedService } from "@fern-typescript/commons-v2";
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
    service: AugmentedService;
    serviceClassName: string;
    serviceFile: SdkFile;
    withEndpoint: (endpoint: HttpEndpoint, run: (args: ServiceDeclarationHandler.withEndpoint.Args) => void) => void;
}): void {
    const client = new Client({ service, serviceClassName });
    const endpoints: Endpoint[] = [];

    const { originalService } = service;
    if (originalService != null) {
        for (const irEndpoint of originalService.endpoints) {
            withEndpoint(irEndpoint, ({ schemaFile }) => {
                const endpoint = new Endpoint({
                    service: originalService,
                    endpoint: irEndpoint,
                });
                endpoint.generate({ schemaFile });
                endpoints.push(endpoint);
            });
        }
    }

    client.generate(serviceFile, endpoints);
}
