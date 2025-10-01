import { CSharpFile } from "@fern-api/csharp-base";
import { ast, Writer } from "@fern-api/csharp-codegen";
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
export class WebSocketClientGenerator {
    private context: SdkGeneratorContext;
    private subpackage: Subpackage;
    private classReference: ast.ClassReference;
    private websocketChannel: WebSocketChannel;
    private optionsClassReference: ast.ClassReference;
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
        subpackage: Subpackage,
        context: SdkGeneratorContext,
        namespace: string,
        websocketChannel: WebSocketChannel
    ): ast.Method[] {
        const methods: ast.Method[] = [];
        const websocketApiName = WebSocketClientGenerator.createWebsocketClientClassName(websocketChannel);
        const createMethodName = `Create${websocketApiName}`;

        const websocketApiClassReference = context.csharp.classReference({
            name: websocketApiName,
            namespace
        });

        const optionsClassReference = context.csharp.classReference({
            name: "Options",
            namespace,
            enclosingType: websocketApiClassReference
        });

        // this.csharp.instantiateClass
        context.csharp.instantiateClass({
            classReference: websocketApiClassReference,
            arguments_: [
                context.csharp.instantiateClass({
                    classReference: optionsClassReference,
                    arguments_: []
                })
            ]
        });

        context.csharp.instantiateClass({
            classReference: websocketApiClassReference,
            arguments_: [context.csharp.codeblock("options")]
        });

        methods.push(
            context.csharp.method({
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
            })
        );
        methods.push(
            context.csharp.method({
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
            })
        );
        return methods;
    }

    /**
     * Initializes a new WebSocket client generator.
     *
     * @param context - The SDK generator context
     * @param subpackage - The subpackage containing the WebSocket channel
     * @param websocketChannel - The WebSocket channel definition to generate code for
     */
    constructor({ context, subpackage, websocketChannel }: WebSocketClientGenerator.Args) {
        this.context = context;
        this.subpackage = subpackage;
        this.websocketChannel = websocketChannel;
        this.classReference = this.csharp.classReference({
            name: WebSocketClientGenerator.createWebsocketClientClassName(websocketChannel),
            namespace: this.context.getSubpackageClassReference(subpackage).namespace
        });
        this.optionsClassReference = this.csharp.classReference({
            name: "Options",
            namespace: this.classReference.namespace,
            enclosingType: this.classReference
        });
        this.optionsParameter = this.csharp.parameter({
            name: "options",
            type: this.csharp.Type.reference(this.optionsClassReference)
        });
        const channelPath = websocketChannel.path.head;

        const envs = this.context.temporaryWebsocketEnvironments;
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
                        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                        .join("")
                }))
            );
            // get the default environment/url from the channel, or failing that the websocketChannel.baseUrl, or failing that the first environment
            this.defaultEnvironment =
                channel.defaultEnvironment ?? this.websocketChannel.baseUrl ?? this.environments[0]?.url;

            if (!this.hasEnvironments) {
                // if they only have one environment, resolve the url of the default environment (since we're not maning the Environments inner class)
                this.defaultEnvironment =
                    this.environments.filter((env) => env.environment === this.defaultEnvironment)[0]?.url ??
                    this.environments[0]?.url;
            }
        }
    }
    private defaultEnvironment: string | undefined;
    private environments: Array<{ environment: string; name: string; url: string }> = [];
    get hasEnvironments() {
        // if it only has one environment, then we're just going to use that as the BaseUrl
        // without the over-head of the using an Environments class.
        return this.environments != null && this.environments.length > 1;
    }

    /**
     * Gets the C# code generation utilities from the context.
     *
     * @returns The C# code generation utilities
     */
    private get csharp() {
        return this.context.csharp;
    }

    private createEnvironmentsClass(): ast.Class | undefined {
        if (!this.hasEnvironments) {
            return undefined;
        }

        const environmentsClass = this.csharp.class_({
            name: "Environments",
            static_: true,
            namespace: this.classReference.namespace,
            enclosingType: this.classReference,
            access: ast.Access.Public
        });
        environmentsClass.addMethod(
            this.csharp.method({
                access: ast.Access.Internal,
                type: ast.MethodType.STATIC,
                name: "getBaseUrl",
                parameters: [this.csharp.parameter({ name: "environment", type: this.csharp.Type.string() })],
                return_: this.csharp.Type.string(),
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
                    writer.dedent();
                    writer.writeLine("}");
                })
            })
        );

        for (const { name, url } of this.environments) {
            environmentsClass.addField(
                this.csharp.field({
                    static_: true,
                    access: ast.Access.Public,
                    name,
                    get: true,
                    set: true,
                    type: this.csharp.Type.string(),
                    initializer: this.csharp.codeblock((writer) => writer.write(`"${url}"`))
                })
            );
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
            name: "Options",
            namespace: this.classReference.namespace,
            enclosingType: this.classReference,
            access: ast.Access.Public,
            parentClassReference: this.context.getAsyncApiOptionsClassReference()
        });
        this.context.temporaryWebsocketEnvironments;

        const baseUrl = `${this.defaultEnvironment ?? this.websocketChannel.baseUrl ?? ""}`;

        optionsClass.addField(
            this.csharp.field({
                access: ast.Access.Public,
                override: true,
                name: "BaseUrl",
                type: this.csharp.Type.string(),
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
            })
        );

        for (const queryParameter of this.websocketChannel.queryParameters) {
            // add to the options class
            optionsClass.addField(
                this.csharp.field({
                    access: ast.Access.Public,
                    name: queryParameter.name.name.pascalCase.safeName,
                    type: this.context.csharpTypeMapper.convert({ reference: queryParameter.valueType }),
                    summary: queryParameter.docs ?? "",
                    get: true,
                    set: true
                })
            );
        }

        return optionsClass;
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
    private createPropertyAccessors() {
        const result: ast.Field[] = [];
        for (const queryParameter of this.websocketChannel.queryParameters) {
            result.push(
                this.csharp.field({
                    access: ast.Access.Public,
                    name: queryParameter.name.name.pascalCase.safeName,
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
                })
            );
        }
        return result;
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
    private createCreateUriMethod() {
        //- implement CreateUri (creates the Uri for the websocket connection)
        //- add sub-path (ie '/chat')
        // - add query parameters for all options

        return this.csharp.method({
            access: ast.Access.Protected,
            override: true,
            name: "CreateUri",
            return_: this.csharp.System.Uri,
            parameters: [],
            body: this.csharp.codeblock((writer) => {
                const hasQueryParameters = this.websocketChannel.queryParameters.length > 0;

                writer.write("return ");
                writer.writeNode(
                    this.csharp.instantiateClass({
                        classReference: this.csharp.System.UriBuilder,
                        arguments_: [
                            this.csharp.codeblock((writer) => {
                                writer.write("BaseUrl.TrimEnd('/')");
                                if (this.websocketChannel.path.head) {
                                    writer.write(` + "${this.websocketChannel.path.head}"`);
                                }
                            })
                        ]
                    })
                );
                if (hasQueryParameters) {
                    writer.write("{\n");
                    writer.indent();
                    writer.write("Query = ");
                    writer.writeNode(
                        this.csharp.instantiateClass({
                            classReference: this.context.getQueryBuilderClassReference(),
                            arguments_: []
                        })
                    );
                    writer.write("{\n");
                    writer.indent();
                    for (const queryParameter of this.websocketChannel.queryParameters) {
                        writer.write(
                            `{ "${queryParameter.name.name.originalName}", ${queryParameter.name.name.pascalCase.safeName} },\n`
                        );
                    }
                    writer.dedent();
                    writer.write("\n}\n}");
                }

                writer.write(`.Uri;`);
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
    private createSetConnectionOptionsMethod() {
        return this.csharp.method({
            access: ast.Access.Protected,
            override: true,
            name: "SetConnectionOptions",
            parameters: [
                this.csharp.parameter({
                    name: "options",
                    type: this.csharp.System.Net.WebSockets.ClientWebSocketOptions
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
                    if (type.isOneOf()) {
                        for (const oneOfType of type.oneOfTypes()) {
                            result.push({
                                type: oneOfType,
                                eventType: this.context.getAsyncEventClassReference(oneOfType),
                                name:
                                    oneOfType.internalType.type === "reference"
                                        ? oneOfType.internalType.value.name
                                        : undefined
                            });
                        }
                    } else {
                        // otherwise it's just a single type here
                        result.push({
                            type,
                            eventType: this.context.getAsyncEventClassReference(type),
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
                    const reference = each.body.bodyType;
                    const type = this.context.csharpTypeMapper.convert({ reference: each.body.bodyType });
                    return {
                        reference: each.body.bodyType,
                        type,
                        eventType: this.context.getAsyncEventClassReference(type),
                        name:
                            reference._visit({
                                container: () => undefined,
                                named: (named) => named.name.pascalCase.safeName,
                                primitive: (value) => undefined,
                                unknown: () => undefined,
                                _other: (value) => value.type
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
    private createOnTextMessageMethod() {
        return this.csharp.method({
            access: ast.Access.Protected,
            override: true,
            isAsync: true,
            name: "OnTextMessage",
            // return_: this.csharp.System.Threading.Tasks.Task(),
            parameters: [
                this.csharp.parameter({
                    name: "stream",
                    type: this.csharp.System.IO.Stream
                })
            ],
            body: this.csharp.codeblock((writer) => {
                // deserialize the json message
                writer.writeLine(`var json = await`);
                writer.writeNode(this.csharp.System.Text.Json.JsonSerializer);
                writer.write(`.DeserializeAsync<`);
                writer.writeNode(this.csharp.System.Text.Json.JsonDocument);
                writer.writeTextStatement(`>(stream)`);
                writer.writeLine(`if(json == null) {`);
                writer.indent();
                writer.writeTextStatement(
                    `await ExceptionOccurred.RaiseEvent(new Exception("Invalid message - Not valid JSON")).ConfigureAwait(false)`
                );
                writer.writeTextStatement(`return`);
                writer.dedent();
                writer.writeLine(`}`);

                // there is no empirical way to determine the correct event type from the IR
                // so the only option is to try each event model until one is successful
                // iterate thru the event models and try to deserialize the message to the correct event

                writer.writeLine();
                writer.writeLine("// deserialize the message to find the correct event");
                writer.writeLine();

                for (const event of this.events) {
                    writer.writeLine(`try {`);
                    writer.indent();
                    writer.write(`var message = json.Deserialize<`);
                    writer.writeNode(event.type);
                    writer.writeTextStatement(`>()`);
                    writer.writeLine(`if(message != null) {`);
                    writer.indent();
                    writer.writeTextStatement(`await ${event.name}.RaiseEvent(message).ConfigureAwait(false)`);
                    writer.writeTextStatement(`return`);
                    writer.dedent();
                    writer.writeLine(`}`);
                    writer.dedent();
                    writer.writeLine(`}`);
                    writer.write(`catch(`);
                    writer.writeNode(this.csharp.System.Exception);
                    writer.writeLine(`) {`);
                    writer.indent();
                    writer.writeLine(`// message is not ${event.name}, continue`);
                    writer.dedent();
                    writer.writeLine(`}`);
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
    private createDisposeEventsMethod() {
        return this.csharp.method({
            access: ast.Access.Protected,
            override: true,
            name: "DisposeEvents",
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
    private createSendMessageMethods(): ast.Method[] {
        return this.messages.map((each) => {
            return this.csharp.method({
                access: ast.Access.Public,
                isAsync: true,
                name: `Send`,
                parameters: [
                    this.csharp.parameter({
                        name: "message",
                        type: each.type
                    })
                ],
                body: this.csharp.codeblock((writer) => {
                    writer.writeLine(`await SendInstant(`);
                    writer.writeNode(this.context.getJsonUtilsClassReference());
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
    private createEventFields(): ast.Field[] {
        return this.events.map((each) => {
            return this.csharp.field({
                readonly: true,
                initializer: this.csharp.codeblock((writer) => writer.write(`new ()`)),
                access: ast.Access.Public,
                type: each.eventType,
                name: `${each.name}`
            });
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
            ...this.classReference,
            access: ast.Access.Public,
            partial: true,
            parentClassReference: this.context.getAsyncApiClassReference(this.optionsClassReference)
        });

        cls.addConstructors([this.createDefaultConstructor(), this.createConstructorWithOptions()]);

        cls.addNestedClass(this.createOptionsClass());
        cls.addFields(this.createPropertyAccessors());
        cls.addMethods([
            this.createCreateUriMethod(),
            this.createSetConnectionOptionsMethod(),
            this.createOnTextMessageMethod(),
            this.createDisposeEventsMethod(),
            ...this.createSendMessageMethods()
        ]);
        cls.addFields(this.createEventFields());
        const environmentsClass = this.createEnvironmentsClass();
        if (environmentsClass != null) {
            cls.addNestedClass(environmentsClass);
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
            allNamespaceSegments: this.csharp.nameRegistry.allNamespacesOf(this.classReference.namespace),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.classReference.namespace,
            customConfig: this.context.customConfig
        });
    }
}
