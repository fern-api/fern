import { Server } from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "../extensions/fernExtensions";

export function convertServer(server: OpenAPIV3.ServerObject): Server {
    return {
        url: getServerUrl({ url: server.url, variables: server.variables ?? {} }),
        description: server.description,
        name: getServerName(server),
        audiences: getExtension<string[]>(server, FernOpenAPIExtension.AUDIENCES)
    };
}

function getServerUrl({
    url,
    variables
}: {
    url: string;
    variables: Record<string, OpenAPIV3.ServerVariableObject>;
}): string {
    const valuesToSubstitute = Object.fromEntries(
        Object.entries(variables).map(([name, declaration]) => {
            return [name, declaration.default];
        })
    );

    for (const [variable, value] of Object.entries(valuesToSubstitute)) {
        url = url.replace(`{${variable}}`, encodeURIComponent(value));
    }

    return url;
}

function getServerName(server: OpenAPIV3.ServerObject): string | undefined {
    const name = getExtension<string>(server, [
        FernOpenAPIExtension.SERVER_NAME_V1,
        FernOpenAPIExtension.SERVER_NAME_V2
    ]);

    if (name != null) {
        return name;
    }

    // Use the description as the server name if it exists
    // This handles common environment names like PRD, SBX, STG, etc.
    if (server.description != null && server.description.trim() !== "") {
        // Normalize common environment names
        const desc = server.description.toLowerCase();
        if (desc === "production" || desc === "prd") {
            return "Production";
        }
        if (desc === "sandbox" || desc === "sbx") {
            return "Sandbox";
        }
        if (desc === "staging" || desc === "stg") {
            return "Staging";
        }
        if (desc === "development" || desc === "dev") {
            return "Development";
        }
        
        // Otherwise, use the description as-is
        return server.description;
    }

    return undefined;
}
