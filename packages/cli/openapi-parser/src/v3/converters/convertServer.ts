import { Server } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension, getExtension } from "../extensions/extensions";

export function convertServer(server: OpenAPIV3.ServerObject): Server {
    const name = getExtension<string>(server, [
        FernOpenAPIExtension.SERVER_NAME_V1,
        FernOpenAPIExtension.SERVER_NAME_V2,
    ]);
    return {
        url: server.url,
        description: server.description,
        name,
    };
}
