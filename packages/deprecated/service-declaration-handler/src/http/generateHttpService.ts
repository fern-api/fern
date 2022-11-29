import { AugmentedService } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { Client } from "./Client";
import { Endpoint } from "./endpoints/Endpoint";

export function generateHttpService({
    service,
    serviceClassName,
    serviceFile,
}: {
    service: AugmentedService;
    serviceClassName: string;
    serviceFile: SdkFile;
}): void {
    const client = new Client({ service, serviceClassName });
    const endpoints: Endpoint[] = [];

    const { originalService } = service;
    if (originalService != null) {
        for (const irEndpoint of originalService.endpoints) {
            const endpoint = new Endpoint({
                service: originalService,
                endpoint: irEndpoint,
            });
            endpoints.push(endpoint);
        }
    }

    client.generate(serviceFile, endpoints);
}
