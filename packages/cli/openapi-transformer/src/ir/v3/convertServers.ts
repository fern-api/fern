import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";

export function convertServers(servers: OpenAPIV3.ServerObject[]): FernOpenapiIr.Server[] {
    return servers.map((server) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const serverName = (server as any)["x-server-name"] as string | undefined;
        return {
            url: server.url,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name: serverName,
            description: server.description,
        };
    });
}
