import { AuthScheme, FernIr, IntermediateRepresentation } from "@fern-api/ir-sdk";
import { convertApiAuth } from "@fern-api/ir-utils";
import { AbstractConverter, AbstractSpecConverter, Converters, Extensions } from "@fern-api/v3-importer-commons";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { ChannelConverter2_X } from "./2.x/channel/ChannelConverter2_X.js";
import { AsyncAPIV2 } from "./2.x/index.js";
import { ServersConverter2_X } from "./2.x/servers/ServersConverter2_X.js";
import { ChannelConverter3_0 } from "./3.0/channel/ChannelConverter3_0.js";
import { AsyncAPIV3 } from "./3.0/index.js";
import { ServersConverter3_0 } from "./3.0/servers/ServersConverter3_0.js";
import { AsyncAPIConverterContext } from "./AsyncAPIConverterContext.js";
import { AbstractChannelConverter } from "./converters/AbstractChannelConverter.js";

export type BaseIntermediateRepresentation = Omit<IntermediateRepresentation, "apiName" | "constants">;

export declare namespace AsyncAPIConverter {
    type Args = AbstractSpecConverter.Args<AsyncAPIConverterContext>;

    type AbstractArgs = AbstractConverter.Args<AsyncAPIConverterContext>;
}

export class AsyncAPIConverter extends AbstractSpecConverter<AsyncAPIConverterContext, IntermediateRepresentation> {
    constructor({ context, breadcrumbs, audiences }: AsyncAPIConverter.Args) {
        super({ context, breadcrumbs, audiences });
    }

    public async convert(): Promise<IntermediateRepresentation> {
        this.context.spec = this.removeXFernIgnores({
            document: this.context.spec
        }) as AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3;

        this.context.spec = (await this.resolveAllExternalRefs({
            spec: this.context.spec
        })) as AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3;

        if (this.isAsyncAPIV3(this.context)) {
            this.convertChannelMessages();
        } else {
            this.convertComponentMessages();
        }

        this.convertSchemas();

        this.convertServers();

        this.convertSecuritySchemes();

        this.convertChannels();

        return this.finalizeIr();
    }

    private isAsyncAPIV3(context: AsyncAPIConverterContext): boolean {
        return parseFloat(context.spec.asyncapi) >= 3;
    }

    private convertChannelMessages(): void {
        const spec = this.context.spec as AsyncAPIV3.DocumentV3;
        for (const [channelPath, channel] of Object.entries(spec.channels ?? {})) {
            for (const [messageId, message] of Object.entries(channel.messages ?? {})) {
                if (!this.context.isMessageWithPayload(message) && !this.context.isReferenceObject(message)) {
                    continue;
                }
                const messageBreadcrumbs = ["channels", channelPath, "messages", messageId];

                const resolvedMessage = this.context.resolveMaybeReference<AsyncAPIV3.ChannelMessage>({
                    schemaOrReference: message,
                    breadcrumbs: messageBreadcrumbs
                });
                if (!this.context.isMessageWithPayload(resolvedMessage)) {
                    continue;
                }
                const messageSchema = this.context.resolveMaybeReference<OpenAPIV3.SchemaObject>({
                    schemaOrReference: resolvedMessage.payload,
                    breadcrumbs: messageBreadcrumbs
                });
                if (messageSchema == null) {
                    continue;
                }
                const typeId = `${channelPath}_${messageId}`;
                this.convertSchema({
                    id: typeId,
                    breadcrumbs: messageBreadcrumbs,
                    schema: messageSchema
                });
            }
        }
    }

    private convertComponentMessages(): void {
        for (const [id, message] of Object.entries(this.context.spec.components?.messages ?? {})) {
            if (message.payload == null) {
                continue;
            }
            const componentBreadcrumbs = ["components", "messages", id];
            const payloadSchema: OpenAPIV3.SchemaObject | undefined =
                this.context.resolveMaybeReference<OpenAPIV3.SchemaObject>({
                    schemaOrReference: message.payload,
                    breadcrumbs: componentBreadcrumbs
                });
            if (payloadSchema == null) {
                continue;
            }

            this.convertSchema({
                id,
                breadcrumbs: componentBreadcrumbs,
                schema: payloadSchema
            });
        }
    }

    private convertSchemas(): void {
        for (const [id, schema] of Object.entries(this.context.spec.components?.schemas ?? {})) {
            this.convertSchema({
                id,
                breadcrumbs: ["components", "schemas", id],
                schema
            });
        }
    }

    private convertSchema({
        id,
        breadcrumbs,
        schema
    }: {
        id: string;
        breadcrumbs: string[];
        schema: OpenAPIV3.SchemaObject;
    }): void {
        const schemaConverter = new Converters.SchemaConverters.SchemaConverter({
            context: this.context,
            id,
            breadcrumbs,
            schema
        });
        const convertedSchema = schemaConverter.convert();
        if (convertedSchema != null) {
            this.addSchemaOutputToIr(id, convertedSchema);
        }
    }

    private convertServers(): void {
        let convertedServers: FernIr.EnvironmentsConfig | undefined;
        if (this.isAsyncAPIV3(this.context)) {
            const servers = this.context.spec.servers as Record<string, AsyncAPIV3.ServerV3>;
            const serversConverter = new ServersConverter3_0({
                context: this.context,
                breadcrumbs: ["servers"],
                servers
            });
            convertedServers = serversConverter.convert();
        } else {
            const servers = this.context.spec.servers as Record<string, AsyncAPIV2.ServerV2>;
            const serversConverter = new ServersConverter2_X({
                context: this.context,
                breadcrumbs: ["servers"],
                servers
            });
            convertedServers = serversConverter.convert();
        }
        this.addEnvironmentsToIr({ environmentConfig: convertedServers });
    }

    private convertSecuritySchemes(): void {
        if (this.context.authOverrides) {
            const overrideAuth = convertApiAuth({
                rawApiFileSchema: this.context.authOverrides,
                casingsGenerator: this.context.casingsGenerator
            });

            this.addAuthToIR({
                requirement: overrideAuth.requirement,
                schemes: overrideAuth.schemes,
                docs: overrideAuth.docs
            });
            return;
        }

        const asyncApiSchemes = this.convertAsyncApiSecuritySchemes();
        if (asyncApiSchemes.length > 0) {
            this.addAuthToIR({
                requirement: asyncApiSchemes.length === 1 ? "ALL" : "ANY",
                schemes: asyncApiSchemes,
                docs: undefined
            });
        }
    }

    private convertAsyncApiSecuritySchemes(): AuthScheme[] {
        const securitySchemes: AuthScheme[] = [];

        for (const [id, securityScheme] of Object.entries(this.context.spec.components?.securitySchemes ?? {})) {
            const resolvedSecurityScheme = this.context.resolveMaybeReference<OpenAPIV3_1.SecuritySchemeObject>({
                schemaOrReference: securityScheme,
                breadcrumbs: ["components", "securitySchemes", id]
            });
            if (resolvedSecurityScheme == null) {
                continue;
            }

            const convertedScheme = this.convertSecurityScheme({
                securityScheme: resolvedSecurityScheme,
                schemeId: id
            });
            if (convertedScheme != null) {
                securitySchemes.push(convertedScheme);
            }
        }

        return securitySchemes;
    }

    private convertSecurityScheme({
        securityScheme,
        schemeId
    }: {
        securityScheme: OpenAPIV3_1.SecuritySchemeObject;
        schemeId: string;
    }): AuthScheme | undefined {
        switch (securityScheme.type) {
            case "http": {
                if (securityScheme.scheme?.toLowerCase() === "bearer") {
                    return AuthScheme.bearer({
                        key: schemeId,
                        token: this.context.casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        tokenPlaceholder: undefined,
                        docs: securityScheme.description
                    });
                }
                if (securityScheme.scheme?.toLowerCase() === "basic") {
                    return AuthScheme.basic({
                        key: schemeId,
                        username: this.context.casingsGenerator.generateName("username"),
                        password: this.context.casingsGenerator.generateName("password"),
                        usernameEnvVar: undefined,
                        passwordEnvVar: undefined,
                        usernameOmit: false,
                        passwordOmit: false,
                        usernamePlaceholder: undefined,
                        passwordPlaceholder: undefined,
                        docs: securityScheme.description
                    });
                }
                break;
            }
            case "apiKey": {
                if (securityScheme.in === "header") {
                    return AuthScheme.header({
                        key: schemeId,
                        name: {
                            name: this.context.casingsGenerator.generateName("apiKey"),
                            wireValue: securityScheme.name
                        },
                        valueType: AbstractConverter.OPTIONAL_STRING,
                        prefix: undefined,
                        headerEnvVar: undefined,
                        headerPlaceholder: undefined,
                        docs: securityScheme.description
                    });
                }
                break;
            }
            case "oauth2": {
                return AuthScheme.bearer({
                    key: schemeId,
                    token: this.context.casingsGenerator.generateName("token"),
                    tokenEnvVar: undefined,
                    tokenPlaceholder: undefined,
                    docs: securityScheme.description
                });
            }
        }
        return undefined;
    }

    private convertChannels(): void {
        for (const [channelPath, channel] of Object.entries(this.context.spec.channels ?? {})) {
            const groupNameExtension = new Extensions.SdkGroupNameExtension({
                breadcrumbs: ["channels", channelPath],
                operation: channel,
                context: this.context
            });
            const websocketGroup = groupNameExtension.convert()?.groups;

            let convertedChannel: AbstractChannelConverter.Output | undefined;
            if (this.isAsyncAPIV3(this.context)) {
                const spec = this.context.spec as AsyncAPIV3.DocumentV3;
                const operations = spec.operations ?? {};

                const channelConverter = new ChannelConverter3_0({
                    context: this.context,
                    breadcrumbs: ["channels", channelPath],
                    websocketGroup,
                    channel,
                    channelPath,
                    operations
                });
                convertedChannel = channelConverter.convert();
            } else {
                const channelConverter = new ChannelConverter2_X({
                    context: this.context,
                    breadcrumbs: ["channels", channelPath],
                    websocketGroup,
                    channel,
                    channelPath
                });
                convertedChannel = channelConverter.convert();
            }
            if (convertedChannel != null) {
                this.addWebsocketChannelToIr({
                    websocketChannel: convertedChannel.channel,
                    channelPath,
                    audiences: convertedChannel.audiences,
                    websocketGroup
                });
                this.addTypesToIr(convertedChannel.inlinedTypes);
            }
        }
    }
}
