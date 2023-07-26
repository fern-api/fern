import { Server } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension } from "../extensions/fernExtensions";
import { getExtension } from "../extensions/getExtension";

export function convertServer(server: OpenAPIV3.ServerObject): Server {
    const name = getExtension<string>(server, [
        FernOpenAPIExtension.SERVER_NAME_V1,
        FernOpenAPIExtension.SERVER_NAME_V2,
    ]);

    if (name == null) {
        if (server.description?.toLowerCase() === "production") {
            return {
                url: server.url,
                description: undefined,
                name: "Production",
            };
        }
        if (server.description?.toLowerCase() === "sandbox") {
            return {
                url: server.url,
                description: undefined,
                name: "Sandbox",
            };
        }
    }
    return {
        url: server.url,
        description: server.description,
        name,
    };
}
