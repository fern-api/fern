import { RawSchemas, isRawMultipleBaseUrlsEnvironment } from "@fern-api/fern-definition-schema"

import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext"

const DEFAULT_URL_NAME = "Base"
const DEFAULT_ENVIRONMENT_NAME = "Default"

function extractUrlsFromEnvironmentSchema(
    record: Record<string, RawSchemas.EnvironmentSchema>
): Record<string, string> {
    return Object.entries(record).reduce<Record<string, string>>((acc, [name, schemaOrUrl]) => {
        if (isRawMultipleBaseUrlsEnvironment(schemaOrUrl)) {
            Object.entries(schemaOrUrl.urls).forEach(([urlsName, urlsValue]) => {
                acc[urlsName] = urlsValue
            })
        } else {
            acc[name] = typeof schemaOrUrl === "string" ? schemaOrUrl : schemaOrUrl.url
        }

        return acc
    }, {})
}

export function buildEnvironments(context: OpenApiIrConverterContext): void {
    if (context.environmentOverrides != null) {
        for (const [environment, environmentDeclaration] of Object.entries(
            context.environmentOverrides.environments ?? {}
        )) {
            context.builder.addEnvironment({
                name: environment,
                schema: environmentDeclaration
            })
        }
        if (context.environmentOverrides["default-environment"] != null) {
            context.builder.setDefaultEnvironment(context.environmentOverrides["default-environment"])
        }
        if (context.environmentOverrides["default-url"] != null) {
            context.builder.setDefaultUrl(context.environmentOverrides["default-url"])
        }
        return
    }

    const topLevelServersWithName: Record<string, string | RawSchemas.SingleBaseUrlEnvironmentSchema> = {}
    const topLevelSkippedServers = []
    for (const server of context.ir.servers) {
        const environmentSchema = server.audiences
            ? {
                  url: server.url,
                  audiences: server.audiences
              }
            : server.url
        if (server.name == null) {
            topLevelSkippedServers.push(environmentSchema)
            continue
        }
        topLevelServersWithName[server.name] = environmentSchema
    }

    const endpointLevelServersWithName: Record<string, string | RawSchemas.SingleBaseUrlEnvironmentSchema> = {}
    const endpointLevelSkippedServers = []
    for (const endpoint of context.ir.endpoints) {
        for (const server of endpoint.servers) {
            if (server.url == null) {
                continue
            }
            const environmentSchema = server.audiences
                ? {
                      url: server.url,
                      audiences: server.audiences
                  }
                : server.url
            if (server.name == null) {
                endpointLevelSkippedServers.push(environmentSchema)
                continue
            }
            endpointLevelServersWithName[server.name] = environmentSchema
        }
    }

    const websocketServersWithName: Record<string, string | RawSchemas.SingleBaseUrlEnvironmentSchema> = {}
    const websocketSkippedServers = []
    for (const server of context.ir.websocketServers) {
        const environmentSchema = server.audiences
            ? {
                  url: server.url,
                  audiences: server.audiences
              }
            : server.url
        if (server.name == null) {
            websocketSkippedServers.push(environmentSchema)
            continue
        }
        websocketServersWithName[server.name] = environmentSchema
    }

    const numTopLevelServersWithName = Object.keys(topLevelServersWithName).length
    const hasTopLevelServersWithName = numTopLevelServersWithName > 0
    const hasEndpointLevelServersWithName = Object.keys(endpointLevelServersWithName).length > 0
    const hasWebsocketServersWithName = Object.keys(websocketServersWithName).length > 0

    // If we don't have any top level or endpoint level servers, we're in the asyncapi only paradigm.
    if (
        !hasTopLevelServersWithName &&
        !hasEndpointLevelServersWithName &&
        hasWebsocketServersWithName &&
        context.ir.servers.length === 0
    ) {
        for (const [name, schema] of Object.entries(websocketServersWithName)) {
            context.builder.addEnvironment({
                name,
                schema
            })
        }
        context.builder.setDefaultEnvironment(Object.keys(websocketServersWithName)[0] as string)
        context.builder.setDefaultUrl(DEFAULT_URL_NAME)
        return
    }

    // Endpoint level servers must always have a name attached. If they don't, we'll throw an error.
    if (endpointLevelSkippedServers.length > 0) {
        context.logger.error(
            `Skipping endpoint level servers ${endpointLevelSkippedServers
                .map((server) => (typeof server === "string" ? server : server.url))
                .join(", ")} because x-fern-server-name was not provided.`
        )
    }

    // In this instance, we don't have any top level servers, so we'll just use the first one at the IR level.
    if (!hasTopLevelServersWithName) {
        const singleURL = context.ir.servers[0]?.url
        const singleURLAudiences = context.ir.servers[0]?.audiences
        if (singleURL != null) {
            const newEnvironmentSchema = singleURLAudiences
                ? {
                      url: singleURL,
                      audiences: singleURLAudiences
                  }
                : singleURL
            topLevelServersWithName[DEFAULT_ENVIRONMENT_NAME] = newEnvironmentSchema
        }
    }

    // We now log an error for all skipped servers that we didn't have a name or construct a name for.
    const topLevelServerUrls = Object.values(topLevelServersWithName).map((schema) =>
        typeof schema === "string" ? schema : schema.url
    )
    const filteredSkippedServers = topLevelSkippedServers.filter((server) => {
        const serverUrl = typeof server === "string" ? server : server.url
        return !topLevelServerUrls.includes(serverUrl)
    })
    if (filteredSkippedServers.length > 0) {
        context.logger.error(
            `Skipping top level servers ${filteredSkippedServers
                .map((server) => (typeof server === "string" ? server : server.url))
                .join(", ")} because x-fern-server-name was not provided.`
        )
    }

    // At this stage, we have at least one top level named server. We now build the environments.
    if (!hasEndpointLevelServersWithName) {
        let firstEnvironment = true
        for (const [name, schema] of Object.entries(topLevelServersWithName)) {
            if (firstEnvironment) {
                if (hasWebsocketServersWithName) {
                    context.builder.addEnvironment({
                        name,
                        schema: {
                            urls: {
                                ...{ [DEFAULT_URL_NAME]: typeof schema === "string" ? schema : schema.url },
                                ...extractUrlsFromEnvironmentSchema(websocketServersWithName)
                            }
                        }
                    })
                } else {
                    context.builder.addEnvironment({
                        name,
                        schema
                    })
                }
                context.builder.setDefaultEnvironment(name)
                firstEnvironment = false
            } else {
                if (hasWebsocketServersWithName) {
                    context.builder.addEnvironment({
                        name,
                        schema: {
                            urls: {
                                ...{ [DEFAULT_URL_NAME]: typeof schema === "string" ? schema : schema.url },
                                ...extractUrlsFromEnvironmentSchema(websocketServersWithName)
                            }
                        }
                    })
                } else {
                    context.builder.addEnvironment({
                        name,
                        schema
                    })
                }
            }
        }
        if (hasWebsocketServersWithName) {
            context.builder.setDefaultUrl(DEFAULT_URL_NAME)
        }
    } else {
        if (numTopLevelServersWithName === 1) {
            const environmentName = Object.keys(topLevelServersWithName)[0] as string
            const topLevelServerSchema = Object.values(topLevelServersWithName)[0] as
                | string
                | RawSchemas.SingleBaseUrlEnvironmentSchema
            const topLevelServerUrl =
                typeof topLevelServerSchema === "string" ? topLevelServerSchema : topLevelServerSchema.url
            context.builder.addEnvironment({
                name: environmentName,
                schema: {
                    urls: {
                        ...{ [DEFAULT_URL_NAME]: topLevelServerUrl },
                        ...extractUrlsFromEnvironmentSchema(endpointLevelServersWithName),
                        ...extractUrlsFromEnvironmentSchema(websocketServersWithName)
                    }
                }
            })
            context.builder.setDefaultEnvironment(environmentName)
            context.builder.setDefaultUrl(DEFAULT_URL_NAME)
        } else {
            let firstEnvironment = true
            for (const [name, schema] of Object.entries(topLevelServersWithName)) {
                if (firstEnvironment) {
                    context.builder.addEnvironment({
                        name,
                        schema: {
                            urls: {
                                ...{ [DEFAULT_URL_NAME]: typeof schema === "string" ? schema : schema.url },
                                ...extractUrlsFromEnvironmentSchema(endpointLevelServersWithName),
                                ...extractUrlsFromEnvironmentSchema(websocketServersWithName)
                            }
                        }
                    })
                    context.builder.setDefaultEnvironment(name)
                    firstEnvironment = false
                } else {
                    context.builder.addEnvironment({
                        name,
                        schema: {
                            urls: {
                                ...{
                                    [DEFAULT_URL_NAME]: typeof schema === "string" ? schema : schema.url
                                },
                                ...extractUrlsFromEnvironmentSchema(endpointLevelServersWithName),
                                ...extractUrlsFromEnvironmentSchema(websocketServersWithName)
                            }
                        }
                    })
                }
            }
            context.builder.setDefaultUrl(DEFAULT_URL_NAME)
        }
    }
}
