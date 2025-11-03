import { CSharpFile } from "@fern-api/csharp-base";
import { ast, is, WithGeneration, Writer } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Subpackage, WebSocketChannel } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

/**
 * Arguments for creating a WebSocket client generator.
 */
export declare namespace WebSocketClientGenerator {
    interface Args {
        /** The subpackage containing the WebSocket channel */
        subpackage: Subpackage;
        /** The SDK generator context */
        context: SdkGeneratorContext;
        /** The WebSocket channel definition */
        websocketChannel: WebSocketChannel;
    }
}

/**
 * Generates C# WebSocket client classes from WebSocket channel definitions.
 *
 * This class creates a complete WebSocket API client that includes:
 * - Connection management with configurable options
 * - Event handling for incoming server messages
 * - Message sending capabilities for client-to-server communication
 * - Automatic JSON serialization/deserialization
 * - Query parameter support for connection URLs
 *
 * The generated client extends from a base AsyncApi class and provides
 * a strongly-typed interface for WebSocket communication.
 */
export class WebSocketClientGenerator extends WithGeneration {
    /** The SDK generator context for code generation utilities */
    private context: SdkGeneratorContext;
    /** The subpackage containing the WebSocket channel definition */
    private subpackage: Subpackage;
    /** The class reference for the generated WebSocket client class */
    private classReference: ast.ClassReference;
    /** The WebSocket channel definition from the IR */
    private websocketChannel: WebSocketChannel;
    /** The class reference for the nested Options class */
    private optionsClassReference: ast.ClassReference;
    /** The parameter definition for the options constructor */
    private optionsParameter: ast.Parameter;

    /**
     * Creates a safe class name for the WebSocket client from the channel name.
     *
     * @param websocketChannel - The WebSocket channel definition
     * @returns A PascalCase class name with "Api" suffix
     */
    static createWebsocketClientClassName(websocketChannel: WebSocketChannel) {
        return `${websocketChannel.name.pascalCase.safeName}Api`;
    }

    /**
     * Creates factory methods for instantiating WebSocket API clients.
     *
     * Generates two overloaded factory methods:
     * - One that creates a client with default options
     * - One that accepts custom options as a parameter
     *
     * @param subpackage - The subpackage containing the WebSocket channel
     * @param context - The SDK generator context
     * @param namespace - The namespace for the generated class
     * @param websocketChannel - The WebSocket channel definition
     * @returns Array of factory method definitions
     */
    static createWebSocketApiFactories(
        cls: ast.Class,
        subpackage: Subpackage,
        context: SdkGeneratorContext,
        namespace: string,
        websocketChannel: WebSocketChannel
    ): void {
        const websocketApiName = WebSocketClientGenerator.createWebsocketClientClassName(websocketChannel);
        const createMethodName = `Create${websocketApiName}`;

        const websocketApiClassReference = context.csharp.classReference({
            origin: websocketChannel,
            name: websocketApiName,
            namespace
        });

        const optionsClassReference = context.csharp.classReference({
            origin: websocketApiClassReference.explicit("Options"),
            enclosingType: websocketApiClassReference
        });

        // if the websocket channel has required options, we can't have a default constructor
        // nor a factory with a default options parameter
        if (!WebSocketClientGenerator.hasRequiredOptions(websocketChannel, context)) {
            cls.addMethod({
                name: createMethodName,
                parameters: [],
                access: ast.Access.Public,
                return_: context.csharp.Type.reference(websocketApiClassReference),
                body: context.csharp.codeblock((writer) => {
                    writer.write("return ");
                    writer.writeNodeStatement(
                        context.csharp.instantiateClass({
                            classReference: websocketApiClassReference,
                            arguments_: [
                                context.csharp.instantiateClass({
                                    classReference: optionsClassReference,
                                    arguments_: []
                                })
                            ]
                        })
                    );
                })
            });
        }
        cls.addMethod({
            name: createMethodName,
            parameters: [
                context.csharp.parameter({
                    name: "options",
                    type: context.csharp.Type.reference(optionsClassReference)
                })
            ],
            access: ast.Access.Public,
            return_: context.csharp.Type.reference(websocketApiClassReference),
            body: context.csharp.codeblock((writer) => {
                writer.write("return ");
                writer.writeNodeStatement(
                    context.csharp.instantiateClass({
                        classReference: websocketApiClassReference,
                        arguments_: [context.csharp.codeblock("options")]
                    })
                );
            })
        });
    }

    /**
     * Initializes a new WebSocket client generator.
     *
     * @param context - The SDK generator context
     * @param subpackage - The subpackage containing the WebSocket channel
     * @param websocketChannel - The WebSocket channel definition to generate code for
     */
    constructor({ context, subpackage, websocketChannel }: WebSocketClientGenerator.Args) {
        super(context);
        this.context = context;
        this.subpackage = subpackage;
        this.websocketChannel = websocketChannel;
        this.classReference = this.csharp.classReference({
            origin: websocketChannel,
            name: WebSocketClientGenerator.createWebsocketClientClassName(websocketChannel),
            namespace: this.context.getSubpackageClassReference(subpackage).namespace
        });
        this.optionsClassReference = this.csharp.classReference({
            origin: this.classReference.explicit("Options"),
            enclosingType: this.classReference
        });
        this.optionsParameter = this.csharp.parameter({
            name: "options",
            type: this.csharp.Type.reference(this.optionsClassReference)
        });
        const channelPath = websocketChannel.path.head;

        const envs = this.settings.temporaryWebsocketEnvironments;
        if (
            envs &&
            envs[channelPath] &&
            envs[channelPath].environments &&
            Object.entries(envs[channelPath].environments).length
        ) {
            const channel = envs[channelPath];
            this.environments.push(
                ...Object.entries(channel.environments).map(([environment, url]) => ({
                    url,
                    environment,
                    name: environment
                        .split(/\W|_/)
                        .filter((p) => p)
                        .map((p) => `${p.charAt(0).toUpperCase()}${p.slice(1)}`)
                        .join("")
                }))
            );
            // get the default environment/url from the channel, or failing that the websocketChannel.baseUrl, or failing that the first environment
            this.defaultEnvironment =
                channel["default-environment"] ?? this.websocketChannel.baseUrl ?? this.environments[0]?.url;

            // check to see if this.defaultEnvironment is either in the environments array
            // or if it is a uri, and if not, then we'll default to the first environment
            if (
                !this.environments.find((env) => env.environment === this.defaultEnvironment) &&
                !this.defaultEnvironment?.match(/^\w+:\/\//)
            ) {
                // no, it is not - we can't use that value unless it's an uri
                this.defaultEnvironment = this.environments[0]?.url;
            }

            if (!this.hasEnvironments) {
                // if they only have one environment, resolve the url of the default environment (since we're not maning the Environments inner class)
                this.defaultEnvironment =
                    this.environments.filter((env) => env.environment === this.defaultEnvironment)[0]?.url ??
                    this.environments[0]?.url;
            }
        }
    }
    /** The default environment URL for WebSocket connections */
    private defaultEnvironment: string | undefined;
    /** Array of available environments with their URLs and names */
    private environments: Array<{ environment: string; name: string; url: string }> = [];

    /**
     * Determines if multiple environments are available.
     *
     * @returns True if there are multiple environments, false if only one (which will be used as BaseUrl)
     */
    get hasEnvironments() {
        // if it only has one environment, then we're just going to use that as the BaseUrl
        // without the over-head of the using an Environments class.
        return this.environments != null && this.environments.length > 1;
    }

    /**
     * Creates the nested Environments class for multi-environment support.
     *
     * This class provides:
     * - Static properties for each environment URL
     * - A getBaseUrl method for environment resolution
     *
     * @returns The Environments class definition, or undefined if only one environment exists
     */
    private createEnvironmentsClass(): ast.Class | undefined {
        if (!this.hasEnvironments) {
            return undefined;
        }

        const environmentsClass = this.csharp.class_({
            origin: this.classReference.explicit("Environments"),
            static_: true,
            doc: this.csharp.xmlDocBlockOf({ summary: "Selectable endpoint URLs for the API client" }),
            namespace: this.classReference.namespace,
            enclosingType: this.classReference,
            access: ast.Access.Public
        });
        environmentsClass.addMethod({
            access: ast.Access.Internal,
            type: ast.MethodType.STATIC,
            name: "getBaseUrl",
            parameters: [this.csharp.parameter({ name: "environment", type: this.csharp.Type.string })],
            return_: this.csharp.Type.string,
            body: this.csharp.codeblock((writer) => {
                writer.write("switch(environment) {");
                for (const { environment, name } of this.environments) {
                    writer.writeLine(`case "${environment.replace(/"/g, '\\"')}":`);
                    if (environment !== name) {
                        writer.writeLine(`case "${name.replace(/"/g, '\\"')}":`);
                    }
                    writer.indent();
                    writer.writeTextStatement(`return ${name}`);
                    writer.dedent();
                }
                writer.writeLine(`default:`);
                writer.indent();

                if (this.defaultEnvironment) {
                    writer.writeTextStatement(
                        `return string.IsNullOrEmpty(environment) ? "${this.defaultEnvironment.replace(/"/g, '\\"')}" : environment`
                    );
                } else {
                    writer.writeTextStatement(`return environment`);
                }
                writer.popScope();
            })
        });

        for (const { name, url } of this.environments) {
            environmentsClass.addField({
                static_: true,
                access: ast.Access.Public,
                origin: environmentsClass.explicit(name),
                get: true,
                set: true,
                type: this.csharp.Type.string,
                initializer: this.csharp.codeblock((writer) => writer.write(`"${url}"`))
            });
        }
        return environmentsClass;
    }

    /**
     * Creates the Options nested class for WebSocket connection configuration.
     *
     * The Options class contains:
     * - BaseUrl property for the WebSocket endpoint
     * - Properties for each query parameter defined in the channel
     *
     * @returns The Options class definition
     */
    private createOptionsClass(): ast.Class {
        const optionsClass = this.csharp.class_({
            reference: this.optionsClassReference,
            doc: this.csharp.xmlDocBlockOf({ summary: "Options for the API client" }),
            access: ast.Access.Public,
            parentClassReference: this.types.AsyncApiOptions
        });
        this.settings.temporaryWebsocketEnvironments;

        const baseUrl = `${this.defaultEnvironment ?? this.websocketChannel.baseUrl ?? ""}`;

        optionsClass.addField({
            origin: optionsClass.explicit("BaseUrl"),
            access: ast.Access.Public,
            override: true,
            type: this.csharp.Type.string,
            summary: "The Websocket URL for the API connection.",
            get: true,
            set: true,
            initializer: !this.hasEnvironments
                ? this.csharp.codeblock((writer) => {
                      writer.write(`"${baseUrl.replace(/"/g, '\\"')}"`);
                  })
                : undefined,
            accessors: this.hasEnvironments
                ? {
                      set: (writer: Writer) => {
                          writer.write(`base.BaseUrl = value`);
                      },
                      get: (writer: Writer) => {
                          writer.writeNode(this.classReference);
                          writer.write(`.Environments.getBaseUrl(base.BaseUrl)`);
                      }
                  }
                : undefined
        });

        if (this.hasEnvironments) {
            optionsClass.addField({
                origin: optionsClass.explicit("Environment"),
                access: ast.Access.Public,
                type: this.csharp.Type.string,
                summary: "The Environment for the API connection.",
                get: true,
                set: true,
                accessors: {
                    set: (writer: Writer) => {
                        writer.write(`base.BaseUrl = value`);
                    },
                    get: (writer: Writer) => {
                        writer.write(`base.BaseUrl`);
                    }
                }
            });
        }

        for (const queryParameter of this.websocketChannel.queryParameters) {
            // add to the options class
            const type = this.context.csharpTypeMapper.convert({ reference: queryParameter.valueType });

            optionsClass.addField({
                origin: queryParameter,
                access: ast.Access.Public,
                type,
                summary: queryParameter.docs ?? "",
                get: true,
                set: true,
                useRequired: !type.isOptional()
            });
        }

        for (const pathParameter of this.websocketChannel.pathParameters) {
            const type = this.context.csharpTypeMapper.convert({ reference: pathParameter.valueType });
            optionsClass.addField({
                origin: pathParameter,
                access: ast.Access.Public,
                type,
                summary: pathParameter.docs ?? "",
                get: true,
                set: true,
                useRequired: !type.isOptional()
            });
        }

        return optionsClass;
    }

    /**
     * Determines if the WebSocket channel has required options that prevent default construction.
     *
     * @param websocketChannel - The WebSocket channel definition
     * @param context - The SDK generator context for type mapping
     * @returns True if any path or query parameters are required
     */
    private static hasRequiredOptions(websocketChannel: WebSocketChannel, context: SdkGeneratorContext) {
        return (
            websocketChannel.pathParameters.some(
                (p) => !context.csharpTypeMapper.convert({ reference: p.valueType }).isOptional()
            ) ||
            websocketChannel.queryParameters.some(
                (p) => !context.csharpTypeMapper.convert({ reference: p.valueType }).isOptional()
            )
        );
    }

    /**
     * Creates the default constructor that initializes with default options.
     *
     * @returns Constructor definition with no parameters
     */
    private createDefaultConstructor() {
        return {
            access: ast.Access.Public,
            parameters: [],
            body: this.csharp.codeblock((writer) => {
                //
            }),
            doc: this.csharp.xmlDocBlockOf({ summary: "Default constructor" }),
            baseConstructorCall: this.csharp.invokeMethod({
                method: "this",
                arguments_: [
                    this.csharp.codeblock((writer) => {
                        writer.writeNode(
                            this.csharp.instantiateClass({
                                classReference: this.optionsClassReference,
                                arguments_: []
                            })
                        );
                    })
                ]
            })
        };
    }

    /**
     * Creates property accessors for query parameters.
     *
     * Each query parameter becomes a public property that:
     * - Gets its value from the ApiOptions
     * - Sets its value with change notification
     *
     * @returns Array of property field definitions
     */
    private createPropertyAccessors(cls: ast.Class) {
        for (const pathParameter of this.websocketChannel.pathParameters) {
            cls.addField({
                origin: pathParameter,
                access: ast.Access.Public,
                type: this.context.csharpTypeMapper.convert({ reference: pathParameter.valueType }),
                summary: pathParameter.docs ?? "",
                accessors: {
                    get: (writer) => {
                        writer.write(`ApiOptions.${pathParameter.name.pascalCase.safeName}`);
                    },
                    set: (writer) => {
                        writer.write(
                            `NotifyIfPropertyChanged( EqualityComparer<string>.Default.Equals(ApiOptions.${pathParameter.name.pascalCase.safeName}), ApiOptions.${pathParameter.name.pascalCase.safeName} = value)`
                        );
                    }
                }
            });
        }

        for (const queryParameter of this.websocketChannel.queryParameters) {
            cls.addField({
                origin: queryParameter,
                access: ast.Access.Public,
                type: this.context.csharpTypeMapper.convert({ reference: queryParameter.valueType }),
                summary: queryParameter.docs ?? "",
                accessors: {
                    get: (writer) => {
                        writer.write(`ApiOptions.${queryParameter.name.name.pascalCase.safeName}`);
                    },
                    set: (writer) => {
                        writer.write(
                            `NotifyIfPropertyChanged( EqualityComparer<string>.Default.Equals(ApiOptions.${queryParameter.name.name.pascalCase.safeName}), ApiOptions.${queryParameter.name.name.pascalCase.safeName} = value)`
                        );
                    }
                }
            });
        }
    }

    /**
     * Creates a constructor that accepts custom options.
     *
     * @returns Constructor definition that takes an Options parameter
     */
    private createConstructorWithOptions() {
        return {
            access: ast.Access.Public,
            parameters: [this.optionsParameter],
            body: this.csharp.codeblock((writer) => {
                //
            }),
            doc: this.csharp.xmlDocBlockOf({ summary: "Constructor with options" }),
            baseConstructorCall: this.csharp.invokeMethod({
                method: "base",
                arguments_: [
                    this.csharp.codeblock((writer) => {
                        writer.write(this.optionsParameter.name);
                    })
                ]
            })
        };
    }

    /**
     * Creates the CreateUri method that builds the WebSocket connection URL.
     *
     * This method:
     * - Combines the base URL with the channel path
     * - Adds query parameters from the options
     * - Returns a properly formatted URI for WebSocket connection
     *
     * @returns The CreateUri method definition
     */
    private createCreateUriMethod(cls: ast.Class) {
        //- implement CreateUri (creates the Uri for the websocket connection)
        //- add sub-path (ie '/chat')
        // - add query parameters for all options

        cls.addMethod({
            access: ast.Access.Protected,
            override: true,
            name: "CreateUri",
            return_: this.extern.System.Uri,
            parameters: [],
            doc: this.csharp.xmlDocBlockOf({
                summary: "Creates the Uri for the websocket connection from the BaseUrl and parameters"
            }),
            body: this.csharp.codeblock((writer) => {
                const hasQueryParameters = this.websocketChannel.queryParameters.length > 0;

                writer.write("var uri = ");
                writer.writeNode(
                    this.extern.System.UriBuilder.instantiate({
                        arguments_: [this.csharp.codeblock((writer) => writer.write("BaseUrl"))]
                    })
                );

                if (hasQueryParameters) {
                    writer.pushScope();

                    writer.write("Query = ");
                    writer.writeNode(
                        this.csharp.instantiateClass({
                            classReference: this.types.QueryBuilder,
                            arguments_: []
                        })
                    );
                    writer.pushScope();
                    for (const queryParameter of this.websocketChannel.queryParameters) {
                        writer.write(
                            `{ "${queryParameter.name.name.originalName}", ${queryParameter.name.name.pascalCase.safeName} },\n`
                        );
                    }
                    writer.popScope();
                    writer.popScope();
                    writer.writeTextStatement(";");
                } else {
                    writer.writeTextStatement(";");
                }

                const parts: (ast.AstNode | string)[] = [];
                // start with the head
                if (this.websocketChannel.path.head) {
                    parts.push(this.websocketChannel.path.head);
                }

                // collect each part (parameter, then tail)
                for (const each of this.websocketChannel.path.parts) {
                    const pp = this.websocketChannel.pathParameters.find(
                        (p) => p.name.originalName === each.pathParameter
                    );
                    if (pp) {
                        parts.push(
                            this.csharp.codeblock((writer) =>
                                writer.write(`Uri.EscapeDataString(${pp.name.pascalCase.safeName})`)
                            )
                        );
                    }
                    if (each.tail) {
                        parts.push(each.tail);
                    }
                }
                if (parts.length) {
                    writer.write(`uri.Path = $"{uri.Path.TrimEnd('/')}`);
                    for (const part of parts) {
                        writer.write(`/`);
                        if (typeof part === "string") {
                            writer.write(part.replace(/^\/+/, "").replace(/\/+$/, ""));
                        } else {
                            writer.write("{", part, "}");
                        }
                    }
                    writer.writeTextStatement(`"`);
                }

                // return the URI
                writer.writeTextStatement("return uri.Uri");
            })
        });
    }

    /**
     * Creates the SetConnectionOptions method for configuring WebSocket connection.
     *
     * This method allows customization of the underlying ClientWebSocketOptions
     * before establishing the connection.
     *
     * @returns The SetConnectionOptions method definition
     */
    private createSetConnectionOptionsMethod(cls: ast.Class) {
        cls.addMethod({
            access: ast.Access.Protected,
            override: true,
            name: "SetConnectionOptions",
            parameters: [
                this.csharp.parameter({
                    name: "options",
                    type: this.extern.System.Net.WebSockets.ClientWebSocketOptions
                })
            ],
            body: this.csharp.codeblock((writer) => {
                //
            })
        });
    }

    /**
     * Gets the server-to-client event definitions from the WebSocket channel.
     *
     * Processes incoming server messages and handles:
     * - Single message types
     * - OneOf message types (expanded into multiple events)
     *
     * @returns Array of event definitions with type, event class, and name
     */
    private get events() {
        const result: {
            type: ast.Type | ast.ClassReference;
            eventType: ast.ClassReference;
            name: string | undefined;
        }[] = [];

        for (const each of this.websocketChannel.messages) {
            if (each.origin === "server" && each.body.type === "reference") {
                const reference = each.body.bodyType;
                const type = this.context.csharpTypeMapper.convert({ reference: each.body.bodyType });
                if (each.body.type === "reference") {
                    const reference = each.body.bodyType;
                    const type = this.context.csharpTypeMapper.convert({ reference: each.body.bodyType });

                    // if the result is a oneof, we will expand it into multiple
                    if (is.Type.oneOf(type)) {
                        for (const oneOfType of type.oneOfTypes()) {
                            result.push({
                                type: oneOfType,
                                eventType: this.types.AsyncEvent(oneOfType),
                                name: is.Type.reference(oneOfType) ? oneOfType.value.name : undefined
                            });
                        }
                    } else {
                        // otherwise it's just a single type here
                        result.push({
                            type,
                            eventType: this.types.AsyncEvent(type),
                            name:
                                reference._visit({
                                    container: () => undefined,
                                    named: (named) => named.name.pascalCase.safeName,
                                    primitive: (value) => undefined,
                                    unknown: () => undefined,
                                    _other: (value) => value.type
                                }) || each.displayName
                        });
                    }
                }
            }
        }
        return result;
    }

    /**
     * Gets the client-to-server message definitions from the WebSocket channel.
     *
     * @returns Array of message definitions that can be sent to the server
     */
    private get messages() {
        return this.websocketChannel.messages
            .filter((message) => message.origin === "client")
            .map((each) => {
                if (each.body.type === "reference") {
                    const bodyType = each.body.bodyType;
                    let type = this.context.csharpTypeMapper.convert({ reference: each.body.bodyType });

                    // if the body type is just a string, this is probably a binary message...
                    if (bodyType.type === "primitive" && bodyType.primitive.v2?.type === "string") {
                        type = this.csharp.Type.binary;
                    }
                    return {
                        reference: each.body.bodyType,
                        type,
                        eventType: this.types.AsyncEvent(type),
                        name:
                            bodyType._visit({
                                container: () => undefined,
                                named: (named) => named.name.pascalCase.safeName,
                                primitive: () => each.type,
                                unknown: () => each.type,
                                _other: () => each.type
                            }) || each.displayName
                    };
                }
                return undefined;
            })
            .filter((each) => each !== undefined);
    }

    /**
     * Creates the OnTextMessage method for handling incoming WebSocket messages.
     *
     * This method:
     * - Deserializes incoming JSON messages
     * - Attempts to match messages to known event types
     * - Raises appropriate events when messages are successfully parsed
     * - Handles unknown message types by raising exceptions
     *
     * @returns The OnTextMessage method definition
     */
    private createOnTextMessageMethod(cls: ast.Class) {
        cls.addMethod({
            access: ast.Access.Protected,
            override: true,
            isAsync: true,
            name: "OnTextMessage",
            doc: this.csharp.xmlDocBlockOf({ summary: "Dispatches incoming WebSocket messages" }),
            parameters: [
                this.csharp.parameter({
                    name: "stream",
                    type: this.extern.System.IO.Stream
                })
            ],
            body: this.csharp.codeblock((writer) => {
                // deserialize the json message
                writer.write(`var json = await `);
                writer.writeNode(this.extern.System.Text.Json.JsonSerializer);
                writer.write(`.DeserializeAsync<`);
                writer.writeNode(this.extern.System.Text.Json.JsonDocument);
                writer.writeTextStatement(`>(stream)`);
                writer.writeLine(`if(json == null)`);
                writer.pushScope();
                writer.writeTextStatement(
                    `await ExceptionOccurred.RaiseEvent(new Exception("Invalid message - Not valid JSON")).ConfigureAwait(false)`
                );
                writer.writeTextStatement(`return`);
                writer.popScope();

                // there is no empirical way to determine the correct event type from the IR
                // so the only option is to try each event model until one is successful
                // iterate thru the event models and try to deserialize the message to the correct event

                writer.writeLine();
                writer.writeLine("// deserialize the message to find the correct event");

                for (const event of this.events) {
                    writer.pushScope();
                    writer.write(
                        `if(`,
                        this.types.JsonUtils,
                        `.TryDeserialize(json`,
                        `, out `,
                        event.name,
                        `? message))`
                    );
                    writer.pushScope();

                    writer.writeTextStatement(`await ${event.name}.RaiseEvent(message!).ConfigureAwait(false)`);
                    writer.writeTextStatement(`return`);

                    writer.popScope();
                    writer.popScope();

                    writer.writeLine();
                }

                // if no event was found, raise an exception
                writer.writeTextStatement(
                    `await ExceptionOccurred.RaiseEvent(new Exception($"Unknown message: {json.ToString()}")).ConfigureAwait(false)`
                );
            })
        });
    }

    /**
     * Creates the DisposeEvents method for cleaning up event subscriptions.
     *
     * @returns The DisposeEvents method definition
     */
    private createDisposeEventsMethod(cls: ast.Class) {
        cls.addMethod({
            access: ast.Access.Protected,
            override: true,
            name: "DisposeEvents",
            doc: this.csharp.xmlDocBlockOf({ summary: "Disposes of event subscriptions" }),
            parameters: [],
            body: this.csharp.codeblock((writer) => {
                //
                for (const event of this.events) {
                    writer.writeTextStatement(`${event.name}.Dispose()`);
                }
            })
        });
    }

    /**
     * Creates Send methods for each client-to-server message type.
     *
     * Each method:
     * - Accepts a strongly-typed message parameter
     * - Serializes the message to JSON
     * - Sends it through the WebSocket connection
     *
     * @returns Array of Send method definitions
     */
    private createSendMessageMethods(cls: ast.Class): void {
        this.messages.forEach((each) => {
            cls.addMethod({
                access: ast.Access.Public,
                isAsync: true,
                name: `Send`,
                parameters: [
                    this.csharp.parameter({
                        name: "message",
                        type: each.type
                    })
                ],
                doc: this.csharp.xmlDocBlockOf({ summary: `Sends a ${each.name} message to the server` }),

                body: this.csharp.codeblock((writer) => {
                    writer.writeLine(`await SendInstant(`);
                    writer.writeNode(this.types.JsonUtils);
                    writer.writeTextStatement(`.Serialize(message)).ConfigureAwait(false)`);
                })
            });
        });
    }

    /**
     * Creates public event fields for subscribing to server messages.
     *
     * Each event field:
     * - Is strongly-typed to the corresponding message type
     * - Allows clients to subscribe to specific message types
     * - Is automatically disposed when the client is disposed
     *
     * @returns Array of event field definitions
     */
    private createEventFields(cls: ast.Class) {
        for (const each of this.events) {
            cls.addField({
                origin: cls.explicit(`${each.name}`),
                readonly: true,
                initializer: this.csharp.codeblock((writer) => writer.write(`new()`)),
                access: ast.Access.Public,
                doc: this.csharp.xmlDocBlockOf({
                    summary: `Event handler for ${each.name}. \nUse ${each.name}.Subscribe(...) to receive messages.`
                }),
                type: each.eventType
            });
        }
    }

    private createEnvironmentFields(cls: ast.Class) {
        cls.addField({
            origin: cls.explicit("Environment"),
            access: ast.Access.Public,
            type: this.csharp.Type.string,
            summary: "The Environment for the API connection.",
            accessors: {
                get: (writer) => {
                    writer.write(`ApiOptions.Environment`);
                },
                set: (writer) => {
                    writer.write(
                        `NotifyIfPropertyChanged( EqualityComparer<string>.Default.Equals(ApiOptions.Environment), ApiOptions.Environment = value)`
                    );
                }
            }
        });
    }

    /**
     * Creates the complete WebSocket client class.
     *
     * Assembles all components into a single class:
     * - Constructors (default and with options)
     * - Nested Options class
     * - Property accessors for query parameters
     * - Core WebSocket methods (CreateUri, SetConnectionOptions, etc.)
     * - Event fields for message handling
     * - Send methods for outgoing messages
     *
     * @returns The complete WebSocket client class definition
     */
    private createWebsocketClass() {
        const cls = this.csharp.class_({
            reference: this.classReference,
            access: ast.Access.Public,
            partial: true,
            doc: this.websocketChannel.docs ? { summary: this.websocketChannel.docs } : undefined,
            parentClassReference: this.types.AsyncApi(this.optionsClassReference)
        });

        if (!WebSocketClientGenerator.hasRequiredOptions(this.websocketChannel, this.context)) {
            cls.addConstructor(this.createDefaultConstructor());
        }

        cls.addConstructor(this.createConstructorWithOptions());

        cls.addNestedClass(this.createOptionsClass());
        this.createPropertyAccessors(cls);
        this.createCreateUriMethod(cls);
        this.createSetConnectionOptionsMethod(cls);
        this.createOnTextMessageMethod(cls);
        this.createDisposeEventsMethod(cls);
        this.createSendMessageMethods(cls);
        this.createEventFields(cls);
        const environmentsClass = this.createEnvironmentsClass();
        if (environmentsClass != null) {
            cls.addNestedClass(environmentsClass);
        }

        if (this.hasEnvironments) {
            this.createEnvironmentFields(cls);
        }
        return cls;
    }

    /**
     * Generates the complete C# WebSocket client file.
     *
     * Creates a CSharpFile containing:
     * - The WebSocket client class with all methods and properties
     * - Proper namespace organization
     * - All necessary type references
     * - Custom configuration settings
     *
     * @returns The generated C# file ready for compilation
     */
    public generate(): CSharpFile {
        return new CSharpFile({
            clazz: this.createWebsocketClass(),
            directory: RelativeFilePath.of(this.context.getDirectoryForSubpackage(this.subpackage)),
            allNamespaceSegments: this.registry.allNamespacesOf(this.classReference.namespace),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.classReference.namespace,
            generation: this.generation
        });
    }
}
