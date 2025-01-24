import { OpenAPIV3 } from "openapi-types";

import { Server } from "@fern-api/openapi-ir";

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
        url = url.replace(`{${variable}}`, value);
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

    if (server.description?.toLowerCase() === "production") {
        return "Production";
    }
    if (server.description?.toLowerCase() === "sandbox") {
        return "Sandbox";
    }

    return undefined;
}
