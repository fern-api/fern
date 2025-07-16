import { MethodObject, OpenrpcDocument, ServerObject } from "@open-rpc/meta-schema"

import { HttpHeader, IntermediateRepresentation, PathParameter, QueryParameter } from "@fern-api/ir-sdk"
import { AbstractSpecConverter, Converters, ServersConverter } from "@fern-api/v2-importer-commons"

import { OpenRPCConverterContext3_1 } from "./OpenRPCConverterContext3_1"
import { ParameterConverter } from "./ParameterConverter"
import { FernParametersExtension } from "./extensions/x-fern-parameters"
import { MethodConverter } from "./methods/MethodConverter"

export type BaseIntermediateRepresentation = Omit<IntermediateRepresentation, "apiName" | "constants">

export declare namespace OpenRPCConverter {
    type Args = AbstractSpecConverter.Args<OpenRPCConverterContext3_1>
}

export class OpenRPCConverter extends AbstractSpecConverter<OpenRPCConverterContext3_1, IntermediateRepresentation> {
    constructor({ context, breadcrumbs, audiences }: OpenRPCConverter.Args) {
        super({ context, breadcrumbs, audiences })
    }

    public async convert(): Promise<IntermediateRepresentation> {
        this.context.spec = this.removeXFernIgnores({
            document: this.context.spec
        }) as OpenrpcDocument

        this.convertSchemas()

        const { endpointLevelServers } = this.convertMethods()

        const { defaultUrl } = this.convertServers({ endpointLevelServers })

        this.updateEndpointsWithDefaultUrl(defaultUrl)

        return this.finalizeIr()
    }

    private convertServers({ endpointLevelServers }: { endpointLevelServers?: ServerObject[] }): {
        defaultUrl: string | undefined
    } {
        const serversConverter = new ServersConverter({
            context: this.context,
            breadcrumbs: ["servers"],
            servers: this.context.spec.servers,
            endpointLevelServers
        })
        const convertedServers = serversConverter.convert()
        this.addEnvironmentsToIr({ environmentConfig: convertedServers?.value })
        return {
            defaultUrl: convertedServers?.defaultUrl
        }
    }

    private convertSchemas(): void {
        for (const [id, schema] of Object.entries(this.context.spec.components?.schemas ?? {})) {
            const schemaConverter = new Converters.SchemaConverters.SchemaConverter({
                context: this.context,
                id,
                breadcrumbs: ["components", "schemas", id],
                schema
            })
            const convertedSchema = schemaConverter.convert()
            if (convertedSchema != null) {
                this.addTypeToPackage(id)
                this.addTypesToIr({
                    ...convertedSchema.inlinedTypes,
                    [id]: convertedSchema.convertedSchema
                })
            }
        }
    }

    private convertMethods(): { endpointLevelServers?: ServerObject[] } {
        // Import the FernParametersExtension to handle custom parameters

        const endpointLevelServers: ServerObject[] = []

        const fernParametersExtension = new FernParametersExtension({
            context: this.context,
            breadcrumbs: ["methods"],
            operation: this.context.spec
        })

        const customParameters = fernParametersExtension.convert()
        // Process custom parameters from x-fern-parameters extension
        const pathParameters: PathParameter[] = []
        const queryParameters: QueryParameter[] = []
        const headers: HttpHeader[] = []

        if (customParameters && customParameters.length > 0) {
            for (const [index, parameter] of customParameters.entries()) {
                const parameterConverter = new ParameterConverter({
                    context: this.context,
                    breadcrumbs: [...this.breadcrumbs, `x-fern-parameters[${index}]`],
                    parameter
                })

                const convertedParameter = parameterConverter.convert()
                if (convertedParameter == null) {
                    continue
                }
                switch (convertedParameter.type) {
                    case "path": {
                        pathParameters.push(convertedParameter.parameter)
                        break
                    }
                    case "query": {
                        queryParameters.push(convertedParameter.parameter)
                        break
                    }
                    case "header": {
                        headers.push(convertedParameter.parameter)
                        break
                    }
                }
            }
        }

        const group = this.context.getGroup({
            groupParts: [],
            namespace: this.context.namespace
        })

        for (const method of this.context.spec.methods ?? []) {
            const resolvedMethod = this.context.resolveMaybeReference<MethodObject>({
                schemaOrReference: method,
                breadcrumbs: ["methods"]
            })
            if (resolvedMethod == null) {
                continue
            }

            const methodConverter = new MethodConverter({
                context: this.context,
                breadcrumbs: ["methods"],
                method: resolvedMethod,
                pathParameters,
                queryParameters,
                headers,
                topLevelServers: this.context.spec.servers
            })

            const convertedMethod = methodConverter.convert()

            if (convertedMethod != null) {
                this.addEndpointToIr({
                    endpoint: convertedMethod.endpoint,
                    audiences: convertedMethod.audiences,
                    endpointGroup: group,
                    serviceName: "service_root"
                })

                this.addTypesToIr(convertedMethod.inlinedTypes)

                if (convertedMethod.servers) {
                    for (const server of convertedMethod.servers) {
                        if (
                            this.shouldAddServerToCollectedServers({
                                server,
                                currentServers: endpointLevelServers,
                                specType: "openrpc"
                            })
                        ) {
                            endpointLevelServers.push(this.maybeDeduplicateServerName(server))
                        }
                    }
                }
            }
        }

        return { endpointLevelServers }
    }

    private maybeDeduplicateServerName(server: ServerObject): ServerObject {
        const conflictingTopLevelServer = this.context.spec.servers?.find(
            (s) => s.name === server.name && s.url !== server.url
        )
        return conflictingTopLevelServer ? { ...server, name: server.url } : server
    }
}
