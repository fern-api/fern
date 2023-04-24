import { Server } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";

export function convertServer(server: OpenAPIV3.ServerObject): Server {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serverName = (server as any)["x-name"] as string | undefined;
    return {
        url: server.url,
        description: server.description,
        name: serverName,
    };
}
