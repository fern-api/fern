import { Server, ServerVariable } from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension.js";
import { FernOpenAPIExtension } from "../extensions/fernExtensions.js";

const X_FERN_DEFAULT_URL = "x-fern-default-url";

export function convertServer(
    server: OpenAPIV3.ServerObject,
    options?: { groupMultiApiEnvironments?: boolean }
): Server {
    const hasVariables = server.variables != null && Object.keys(server.variables).length > 0;
    const defaultUrl = extractFernDefaultUrl(server);

    return {
        url: getServerUrl({ url: server.url, variables: server.variables ?? {} }),
        description: server.description,
        name: getServerName(server, options),
        audiences: getExtension<string[]>(server, FernOpenAPIExtension.AUDIENCES),
        // Preserve server variables for runtime URL configuration
        urlTemplate: hasVariables ? server.url : undefined,
        variables: hasVariables && server.variables != null ? convertServerVariables(server.variables) : undefined,
        defaultUrl: hasVariables ? defaultUrl : undefined
    };
}

/**
 * Extracts the x-fern-default-url extension from a server object.
 * This URL is used as a fallback when no variables are provided.
 */
function extractFernDefaultUrl(server: OpenAPIV3.ServerObject): string | undefined {
    const defaultUrl = (server as unknown as Record<string, unknown>)[X_FERN_DEFAULT_URL];
    if (typeof defaultUrl === "string") {
        return defaultUrl.endsWith("/") && defaultUrl !== "/" ? defaultUrl.slice(0, -1) : defaultUrl;
    }
    return undefined;
}

function convertServerVariables(variables: Record<string, OpenAPIV3.ServerVariableObject>): ServerVariable[] {
    return Object.entries(variables).map(([variableId, variable]) => ({
        id: variableId,
        default: variable.default,
        values: variable.enum
    }));
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

function getServerName(
    server: OpenAPIV3.ServerObject,
    options?: { groupMultiApiEnvironments?: boolean }
): string | undefined {
    const name = getExtension<string>(server, [
        FernOpenAPIExtension.SERVER_NAME_V1,
        FernOpenAPIExtension.SERVER_NAME_V2
    ]);

    if (name != null) {
        return name;
    }

    // Always preserve the original logic for basic environment names
    if (server.description?.toLowerCase() === "production") {
        return "Production";
    }
    if (server.description?.toLowerCase() === "sandbox") {
        return "Sandbox";
    }

    // Additional environment name handling only when multi-API environment grouping is enabled
    if (options?.groupMultiApiEnvironments && server.description != null && server.description.trim() !== "") {
        const desc = server.description.toLowerCase();
        if (desc === "prd") {
            return "Production";
        }
        if (desc === "sbx") {
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
