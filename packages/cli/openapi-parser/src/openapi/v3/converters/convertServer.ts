import { Server } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "../extensions/fernExtensions";

interface ServerConfig {
    name: string;
    environment: string | undefined;
}

export function convertServer(server: OpenAPIV3.ServerObject): Server {
    const initServer = {
        url: getServerUrl({ url: server.url, variables: server.variables ?? {} }),
<<<<<<< HEAD
        description: server.description,
        name: getServerName(server),
        audiences: getExtension<string[]>(server, FernOpenAPIExtension.AUDIENCES)
=======
        description: server.description
>>>>>>> c508a0bcfe (improvement: allow specifying multi-environment urls from openapi)
    };

    const maybeFullServerConfig = getFullServerCOnfig(server);
    if (maybeFullServerConfig != null) {
        return {
            ...initServer,
            ...maybeFullServerConfig
        };
    }

    return {
        ...initServer,
        name: getServerName(server),
        environment: getServerEnvironment(server)
    };
}

export function getDefaultEnvironmentName(document: OpenAPIV3.Document): string | undefined {
    return getExtension<string>(document, FernOpenAPIExtension.SERVER_DEFAULT_ENVIRONMENT);
}

function getFullServerCOnfig(server: OpenAPIV3.ServerObject): ServerConfig | undefined {
    return getExtension<ServerConfig>(server, FernOpenAPIExtension.SERVER_CONFIG);
}

function getServerEnvironment(server: OpenAPIV3.ServerObject): string | undefined {
    return getExtension<string>(server, FernOpenAPIExtension.SERVER_ENVIRONMENT);
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
