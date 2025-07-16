import { OpenAPIV3_1 } from 'openapi-types'

import { isNonNullish } from '@fern-api/core-utils'
import {
    Environments,
    EnvironmentsConfig,
    MultipleBaseUrlsEnvironment,
    SingleBaseUrlEnvironment
} from '@fern-api/ir-sdk'

import { AbstractConverter, AbstractConverterContext } from '../..'
import { ServerNameExtension } from '../../extensions/x-fern-server-name'

const DEFAULT_BASE_URL_ID = 'Base'

export declare namespace ServersConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        servers?: OpenAPIV3_1.ServerObject[]
        endpointLevelServers?: OpenAPIV3_1.ServerObject[]
    }

    export interface Output {
        value: EnvironmentsConfig
        defaultUrl?: string
    }
}

export class ServersConverter extends AbstractConverter<
    AbstractConverterContext<object>,
    ServersConverter.Output | undefined
> {
    private readonly servers?: OpenAPIV3_1.ServerObject[]
    private readonly endpointLevelServers?: OpenAPIV3_1.ServerObject[]

    constructor({ breadcrumbs, context, servers, endpointLevelServers }: ServersConverter.Args) {
        super({ breadcrumbs, context })
        this.servers = servers
        this.endpointLevelServers = endpointLevelServers
    }

    public convert(): ServersConverter.Output | undefined {
        if (this.servers == null || this.servers.length === 0 || this.servers[0] == null) {
            return undefined
        }

        if (this.endpointLevelServers != null && this.endpointLevelServers.length > 0) {
            const defaultBaseUrlId = this.getDefaultBaseUrlName()
            const defaultBaseUrl = {
                id: defaultBaseUrlId,
                name: this.context.casingsGenerator.generateName(defaultBaseUrlId)
            }
            const endpointUrls = this.endpointLevelServers
                .map((server) => {
                    const serverName = ServersConverter.getServerName({
                        server,
                        context: this.context
                    })
                    return {
                        id: serverName,
                        name: this.context.casingsGenerator.generateName(serverName)
                    }
                })
                .filter((url, index, self) => self.findIndex((t) => t.id === url.id) === index)

            const baseUrls = [defaultBaseUrl, ...endpointUrls]

            const environments: MultipleBaseUrlsEnvironment[] = this.servers.map((baseUrl) => {
                const serverName = ServersConverter.getServerName({
                    server: baseUrl,
                    context: this.context
                })
                const endpointLevelServers = this.endpointLevelServers?.map((server) => [
                    ServersConverter.getServerName({ server, context: this.context }),
                    this.getServerUrl(server)
                ])
                return {
                    id: serverName,
                    name: this.context.casingsGenerator.generateName(serverName),
                    urls: {
                        [defaultBaseUrlId]: this.getServerUrl(baseUrl),
                        ...Object.fromEntries(endpointLevelServers ?? [])
                    },
                    docs: baseUrl.description
                }
            })

            return {
                value: {
                    defaultEnvironment: environments[0]?.id,
                    environments: Environments.multipleBaseUrls({
                        baseUrls,
                        environments
                    })
                },
                defaultUrl: defaultBaseUrl.id
            }
        }

        const environments: SingleBaseUrlEnvironment[] = this.withExplodedServers(this.servers)
            .map((server) => {
                const serverName = ServersConverter.getServerName({ server, context: this.context })
                return {
                    id: serverName,
                    name: this.context.casingsGenerator.generateName(serverName),
                    url: this.maybeRemoveTrailingSlashIfNotEmpty(this.getServerUrl(server)),
                    docs: server.description
                }
            })
            .filter(isNonNullish)

        return {
            value: {
                defaultEnvironment: environments[0]?.id,
                environments: Environments.singleBaseUrl({
                    environments
                })
            },
            defaultUrl: environments[0]?.id
        }
    }

    public static getServerExtensionName({
        server,
        context
    }: {
        server: OpenAPIV3_1.ServerObject
        context: AbstractConverterContext<object>
    }): string | undefined {
        return new ServerNameExtension({ breadcrumbs: [], server, context }).convert()
    }

    public static getServerName({
        server,
        context
    }: {
        server: OpenAPIV3_1.ServerObject & { name?: string }
        context: AbstractConverterContext<object>
    }): string {
        if (server.name != null) {
            return server.name
        }
        const serverExtensionName = ServersConverter.getServerExtensionName({ server, context })
        return serverExtensionName ?? server.description ?? server.url
    }

    private getServerUrl(server: OpenAPIV3_1.ServerObject): string {
        if (server.variables == null) {
            return server.url
        }

        let url = server.url
        for (const [variableName, variable] of Object.entries(server.variables)) {
            if (variable.default != null) {
                url = url.replace(`{${variableName}}`, encodeURIComponent(variable.default))
            }
        }
        return url
    }

    /**
     * Explodes servers with enum variables into multiple servers, one for each enum value.
     * For example, a server with URL "https://{region}.example.com" where region is an enum ["us", "eu"]
     * will be exploded into two servers: "https://us.example.com" and "https://eu.example.com"
     */
    private withExplodedServers(servers: OpenAPIV3_1.ServerObject[]): OpenAPIV3_1.ServerObject[] {
        return servers
            .flatMap((server) => {
                if (server.variables == null) {
                    return [server]
                }

                const variablesWithEnums = Object.entries(server.variables).filter(
                    ([_, variable]) => variable.enum != null && variable.enum.length > 0
                )

                if (variablesWithEnums.length === 0) {
                    return [server]
                }

                // Take the first variable with an enum to explode
                const firstVariable = variablesWithEnums[0]
                if (firstVariable == null) {
                    return [server]
                }
                const [variableName, variable] = firstVariable

                if (variable.enum == null) {
                    return [server]
                }

                return variable.enum.map((enumValue) => {
                    const newUrl = server.url.replace(`{${variableName}}`, encodeURIComponent(enumValue))

                    // Create a new server with the variable replaced in the URL
                    // and remove the exploded variable from variables
                    const newVariables: Record<string, OpenAPIV3_1.ServerVariableObject> = {}

                    // Copy all variables except the one we're exploding
                    for (const [key, value] of Object.entries(server.variables ?? {})) {
                        if (key !== variableName) {
                            newVariables[key] = value
                        }
                    }

                    const newServer: OpenAPIV3_1.ServerObject & { [key: string]: unknown } = {
                        ...server,
                        url: newUrl,
                        variables: Object.keys(newVariables).length > 0 ? newVariables : undefined,
                        'x-fern-server-name': server.description
                            ? `${server.description}_${enumValue}`
                            : `${enumValue}`,
                        description: server.description
                    }

                    // Recursively explode any remaining enum variables
                    return this.withExplodedServers([newServer])[0]
                })
            })
            .filter(isNonNullish)
    }

    private getDefaultBaseUrlName(): string {
        if (this.servers == null || this.servers.length === 0 || this.servers[0] == null) {
            return DEFAULT_BASE_URL_ID
        }
        return (
            ServersConverter.getServerExtensionName({
                server: this.servers[0],
                context: this.context
            }) ?? DEFAULT_BASE_URL_ID
        )
    }

    private maybeRemoveTrailingSlashIfNotEmpty(url: string): string {
        return url.endsWith('/') && url !== '/' ? url.slice(0, -1) : url
    }
}
