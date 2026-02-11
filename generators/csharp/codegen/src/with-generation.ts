import { type Generation } from "./context/generation-info";

/**
 * A trivial class of convenience properties that a generator class can inherit from to gain access to the portable context features.
 *
 * This base class provides convenient access to common generation context properties through protected getters,
 * eliminating the need to repeatedly access `this.ctx.generation.*` throughout generator implementations.
 */
export class WithGeneration {
    public constructor(protected readonly generation: Generation) {}

    /** Provides access to C# code generation utilities */
    protected get csharp(): import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/csharp").CSharp {
        return this.generation.csharp;
    }

    /** Provides access to generation settings and configuration */
    protected get settings(): {
        namespace: string;
        readOnlyMemoryTypes: string[];
        simplifyObjectDictionaries: boolean;
        useFullyQualifiedNamespaces: boolean;
        useDotnetFormat: boolean;
        enableWebsockets: boolean;
        enableReadonlyConstants: boolean;
        enableExplicitNullableOptional: boolean;
        useDefaultRequestParameterValues: boolean;
        temporaryWebsocketEnvironments: Record<
            string,
            { environments: Record<string, string>; "default-environment"?: string | undefined }
        >;
        baseApiExceptionClassName: string;
        baseExceptionClassName: string;
        shouldGeneratedDiscriminatedUnions: boolean;
        shouldGenerateUndiscriminatedUnions: boolean;
        exportedClientClassName: string;
        clientClassName: string;
        rootNamespaceForCoreClasses: boolean;
        packageId: string;
        isForwardCompatibleEnumsEnabled: boolean;
        websocketEnvironments: Record<
            string,
            { environments: Record<string, string>; "default-environment"?: string | undefined }
        >;
        customPagerName: string;
        environmentClassName: string;
        generateErrorTypes: boolean;
        shouldInlinePathParameters: boolean;
        includeExceptionHandler: boolean;
        exceptionInterceptorClassName: string;
        shouldGenerateMockServerTests: boolean;
        rootClientAccess: "public" | "internal";
        extraDependencies: Record<string, string>;
        pascalCaseEnvironments: boolean;
        explicitNamespaces: boolean;
        outputPath: { library: string; test: string; solution: string; other: string };
    } {
        return this.generation.settings;
    }

    /** Provides access to generation constants */
    protected get constants(): {
        folders: {
            mockServerTests: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/index").TRelativeFilePath;
            types: string;
            exceptions: string;
            src: string;
            protobuf: string;
            serializationTests: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/index").TRelativeFilePath;
            project: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/index").TRelativeFilePath;
            sourceFiles: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/index").TRelativeFilePath;
            coreFiles: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/index").TRelativeFilePath;
            publicCoreFiles: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/index").TRelativeFilePath;
            testFiles: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/index").TRelativeFilePath;
        };
        formatting: { indent: string };
        defaults: { core: string; publicCore: string; version: string };
    } {
        return this.generation.constants;
    }

    /** Provides access to namespace management utilities */
    protected get namespaces(): {
        root: string;
        core: string;
        test: string;
        testUtils: string;
        mockServerTest: string;
        publicCore: string;
        webSocketsCore: string;
        publicCoreTest: string;
        asIsTestUtils: string;
        publicCoreClasses: string;
        implicit: Set<string>;
    } {
        return this.generation.namespaces;
    }

    /** Provides access to naming utilities for generating consistent identifiers */
    protected get names(): {
        classes: {
            baseApiException: string;
            baseException: string;
            rootClient: string;
            rootClientForSnippets: string;
            customPager: string;
            environment: string;
            exceptionInterceptor: string;
        };
        project: { client: string; clientPrefix: string; packageId: string };
        files: { project: string; testProject: string };
        methods: {
            mockOauth: string;
            mockInferredAuth: string;
            getAccessTokenAsync: string;
            getAuthHeadersAsync: string;
        };
        variables: {
            client: string;
            response: string;
            httpRequest: string;
            sendRequest: string;
            responseBody: string;
            query: string;
            headers: string;
        };
        parameters: { cancellationToken: string; requestOptions: string; idempotentOptions: string };
    } {
        return this.generation.names;
    }

    /** Provides access to the model navigation and inspection utilities */
    protected get model(): import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/context/model-navigator").ModelNavigator {
        return this.generation.model;
    }
    /** Provides access to text formatting utilities */
    protected get format(): { private: (name: string) => string } {
        return this.generation.format;
    }

    /** Provides access to the type registry for looking up generated types */
    protected get registry(): import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/index").NameRegistry {
        return this.generation.registry;
    }
    /** Provides access to type information and utilities */
    protected get Types(): {
        Arbitrary: (
            name: string
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Primitive.AribitraryType;
        HttpMethodExtensions: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        FormRequest: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        Optional: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        ClientOptions: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        RawClient: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        RequestOptions: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        RequestOptionsInterface: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        JsonRequest: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        Version: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        ValueConvert: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        FileParameter: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        Headers: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        HeaderValue: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        RootClient: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        RootClientForSnippets: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        BaseApiException: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        BaseException: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        ExceptionInterceptor: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        ExceptionHandler: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        CustomExceptionInterceptor: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        ProtoAnyMapper: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        Constants: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        EnumSerializer: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        DateTimeSerializer: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        JsonUtils: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        JsonAssert: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        CustomPagerFactory: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        CustomPagerContext: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        Environments: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        TestClient: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        BaseMockServerTest: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        IdempotentRequestOptions: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        IdempotentRequestOptionsInterface: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        IStringEnum: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        WebSocketClient: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        QueryBuilder: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        QueryStringBuilder: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        QueryStringBuilderBuilder: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        OAuthTokenProvider: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        InferredAuthTokenProvider: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        ProtoConverter: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        RawGrpcClient: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        Extensions: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        GrpcRequestOptions: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        GrpcChannelOptions: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        StringEnum: (
            genericType?:
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        WebSocketEvent: (
            genericType:
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        ConnectionStatus: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        WebSocketConnected: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        WebSocketClosed: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        StringEnumSerializer: (
            enumClassReference:
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        CustomPagerClass: (
            itemType:
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        Pager: (
            itemType:
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        OffsetPager: ({
            requestType,
            requestOptionsType,
            responseType,
            offsetType,
            stepType,
            itemType
        }: {
            requestType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type;
            requestOptionsType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type;
            responseType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type;
            offsetType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type;
            stepType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type;
            itemType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type;
        }) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        CursorPager: ({
            requestType,
            requestOptionsType,
            responseType,
            cursorType,
            itemType
        }: {
            requestType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type;
            requestOptionsType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type;
            responseType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type;
            cursorType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type;
            itemType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type;
        }) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        CollectionItemSerializer: (
            itemType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference,
            serializer: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        OneOfSerializer: (
            oneof:
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        AdditionalProperties: (
            genericType?:
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        ReadOnlyAdditionalProperties: (
            genericType?:
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
    } {
        return this.generation.Types;
    }

    /** Provides access to .NET System namespace types and utilities */
    public get System(): {
        Action: (
            typeParameters?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type[]
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        Func: (
            typeParameters?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type[],
            returnType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        DateOnly: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        DateTime: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        Enum: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        Exception: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        ReadOnlyMemory: (
            type: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        Serializable: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        String: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        Type: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        TimeSpan: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        Uri: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        UriBuilder: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        Runtime: {
            Serialization: {
                EnumMember: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            };
        };
        Collections: {
            Generic: {
                IAsyncEnumerable: (
                    elementType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                IEnumerable: (
                    elementType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                KeyValuePair: (
                    keyType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type,
                    valueType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                List: (
                    elementType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                HashSet: (
                    elementType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                Dictionary: (
                    keyType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type,
                    valueType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                IDictionary: (
                    keyType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type,
                    valueType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            };
            Linq: {
                Enumerable: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            };
        };
        Globalization: {
            DateTimeStyles: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        };
        Linq: { Enumerable: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference };
        Net: {
            Http: {
                HttpClient: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                HttpMethod: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                HttpResponseHeaders: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            };
            ServerSentEvents: {
                SseEvent: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                SseParser: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            };
            WebSockets: {
                ClientWebSocketOptions: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            };
        };
        IO: {
            MemoryStream: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            Stream: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            StreamReader: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        };
        Text: {
            Encoding: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            Encoding_UTF8: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            Json: {
                JsonElement: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                JsonDocument: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                JsonException: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                Utf8JsonReader: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                JsonSerializerOptions: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                JsonSerializer: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                Utf8JsonWriter: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                Nodes: {
                    JsonNode: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                    JsonObject: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                };
                Serialization: {
                    IJsonOnDeserialized: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                    IJsonOnSerializing: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                    JsonOnDeserializedAttribute: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                    JsonExtensionData: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                    JsonConverter: (
                        typeToConvert?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                    ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                    JsonIgnore: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                    JsonPropertyName: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                };
            };
        };
        Threading: {
            CancellationToken: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            Tasks: {
                Task: (
                    ofType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                ValueTask: (
                    ofType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            };
        };
        ComponentModel: {
            INotifyPropertyChanged: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            PropertyChangedEventHandler: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        };
        IAsyncDisposable: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        IDisposable: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
    } {
        return this.generation.extern.System;
    }

    /** Provides access to NUnit testing framework types */
    public get NUnit(): {
        Framework: {
            TestFixture: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            Test: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            OneTimeTearDown: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            OneTimeSetUp: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            SetUpFixture: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        };
    } {
        return this.generation.extern.NUnit;
    }

    /** Provides access to OneOf discriminated union library types */
    public get OneOf(): {
        OneOf: (
            generics?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type[]
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        OneOfBase: (
            generics?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type[]
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
    } {
        return this.generation.extern.OneOf;
    }

    /** Provides access to Google protocol buffer types */
    public get Google(): {
        Protobuf: {
            WellKnownTypes: {
                Struct: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                Value: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                ListValue: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
                Timestamp: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
            };
        };
    } {
        return this.generation.extern.Google;
    }
    public get Grpc(): {
        Core: {
            RpcException: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        };
    } {
        return this.generation.extern.Grpc;
    }
    /** Provides access to WireMock.Net testing/mocking library types */
    public get WireMock(): {
        Server: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        WireMockServerSettings: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
        WireMockConsoleLogger: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference;
    } {
        return this.generation.extern.WireMock;
    }
    /** Provides access to primitive types */
    public get Primitive(): {
        string: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Primitive.String;
        boolean: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Primitive.Boolean;
        integer: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Primitive.Integer;
        long: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Primitive.Long;
        uint: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Primitive.Uint;
        ulong: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Primitive.ULong;
        float: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Primitive.Float;
        double: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Primitive.Double;
        object: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Primitive.Object;
    } {
        return this.generation.Primitive;
    }
    /** Provides access to value types */
    public get Value(): {
        binary: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Value.Binary;
        dateOnly: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Value.DateOnly;
        dateTime: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Value.DateTime;
        uuid: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Value.Uuid;
        stringEnum: (
            value: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").ClassReference
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Value.StringEnum;
    } {
        return this.generation.Value;
    }
    /** Provides access to collection types */
    public get Collection(): {
        array: (
            value: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Collection.Array;
        listType: (
            value: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Collection.ListType;
        list: (
            value: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Collection.List;
        set: (
            value: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Collection.Set;
        map: (
            keyType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type,
            valueType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type,
            options?: { dontSimplify?: boolean }
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Collection.Map;
        idictionary: (
            keyType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type,
            valueType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type,
            options?: { dontSimplify?: boolean }
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Collection.IDictionary;
        keyValuePair: (
            keyType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type,
            valueType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Collection.KeyValuePair;
    } {
        return this.generation.Collection;
    }
}
