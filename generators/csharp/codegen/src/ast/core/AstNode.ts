import {
    AbstractAstNode,
    AbstractFormatter,
    addGlobalFunctionFilter,
    at,
    enableStackTracking,
    getFramesForTaggedObject
} from "@fern-api/browser-compatible-base-generator";
import { Generation } from "../../context/generation-info";
import { type Origin } from "../../context/model-navigator";
import { type Class } from "../types/Class";
import { type ClassReference } from "../types/ClassReference";
import { type Interface } from "../types/Interface";
import { Writer } from "./Writer";

type Namespace = string;

export interface FormattedAstNodeSnippet {
    imports: string | undefined;
    body: string;
}

// don't track stack frames for the internals of AstNode.
addGlobalFunctionFilter("AstNode");

export abstract class AstNode extends AbstractAstNode {
    constructor(public readonly generation: Generation) {
        super();
    }

    protected get csharp(): import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/csharp").CSharp {
        return this.generation.csharp;
    }
    protected get registry(): import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/index").NameRegistry {
        return this.generation.registry;
    }
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
    protected get model(): import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/context/model-navigator").ModelNavigator {
        return this.generation.model;
    }
    protected get format(): { private: (name: string) => string } {
        return this.generation.format;
    }
    protected get Types(): {
        Arbitrary: (
            name: string
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Primitive.AribitraryType;
        HttpMethodExtensions: ClassReference;
        FormRequest: ClassReference;
        Optional: ClassReference;
        ClientOptions: ClassReference;
        RawClient: ClassReference;
        RequestOptions: ClassReference;
        RequestOptionsInterface: ClassReference;
        JsonRequest: ClassReference;
        Version: ClassReference;
        ValueConvert: ClassReference;
        FileParameter: ClassReference;
        Headers: ClassReference;
        HeaderValue: ClassReference;
        RootClient: ClassReference;
        RootClientForSnippets: ClassReference;
        BaseApiException: ClassReference;
        BaseException: ClassReference;
        ExceptionInterceptor: ClassReference;
        ExceptionHandler: ClassReference;
        CustomExceptionInterceptor: ClassReference;
        ProtoAnyMapper: ClassReference;
        Constants: ClassReference;
        EnumSerializer: ClassReference;
        DateTimeSerializer: ClassReference;
        JsonUtils: ClassReference;
        JsonAssert: ClassReference;
        CustomPagerFactory: ClassReference;
        CustomPagerContext: ClassReference;
        Environments: ClassReference;
        TestClient: ClassReference;
        BaseMockServerTest: ClassReference;
        IdempotentRequestOptions: ClassReference;
        IdempotentRequestOptionsInterface: ClassReference;
        IStringEnum: ClassReference;
        WebSocketClient: ClassReference;
        QueryBuilder: ClassReference;
        QueryStringBuilder: ClassReference;
        QueryStringBuilderBuilder: ClassReference;
        OAuthTokenProvider: ClassReference;
        InferredAuthTokenProvider: ClassReference;
        ProtoConverter: ClassReference;
        RawGrpcClient: ClassReference;
        Extensions: ClassReference;
        GrpcRequestOptions: ClassReference;
        GrpcChannelOptions: ClassReference;
        StringEnum: (
            genericType?:
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                | ClassReference
        ) => ClassReference;
        WebSocketEvent: (
            genericType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type | ClassReference
        ) => ClassReference;
        ConnectionStatus: ClassReference;
        WebSocketConnected: ClassReference;
        WebSocketClosed: ClassReference;
        StringEnumSerializer: (
            enumClassReference:
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                | ClassReference
        ) => ClassReference;
        CustomPagerClass: (
            itemType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type | ClassReference
        ) => ClassReference;
        Pager: (
            itemType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type | ClassReference
        ) => ClassReference;
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
        }) => ClassReference;
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
        }) => ClassReference;
        CollectionItemSerializer: (itemType: ClassReference, serializer: ClassReference) => ClassReference;
        OneOfSerializer: (
            oneof: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type | ClassReference
        ) => ClassReference;
        AdditionalProperties: (
            genericType?:
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                | ClassReference
        ) => ClassReference;
        ReadOnlyAdditionalProperties: (
            genericType?:
                | import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                | ClassReference
        ) => ClassReference;
    } {
        return this.generation.Types;
    }

    protected get System(): {
        Action: (
            typeParameters?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type[]
        ) => ClassReference;
        Func: (
            typeParameters?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type[],
            returnType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
        ) => ClassReference;
        DateOnly: ClassReference;
        DateTime: ClassReference;
        Enum: ClassReference;
        Exception: ClassReference;
        ReadOnlyMemory: (
            type: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
        ) => ClassReference;
        Serializable: ClassReference;
        String: ClassReference;
        Type: ClassReference;
        TimeSpan: ClassReference;
        Uri: ClassReference;
        UriBuilder: ClassReference;
        Runtime: { Serialization: { EnumMember: ClassReference } };
        Collections: {
            Generic: {
                IAsyncEnumerable: (
                    elementType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => ClassReference;
                IEnumerable: (
                    elementType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => ClassReference;
                KeyValuePair: (
                    keyType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type,
                    valueType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => ClassReference;
                List: (
                    elementType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => ClassReference;
                HashSet: (
                    elementType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => ClassReference;
                Dictionary: (
                    keyType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type,
                    valueType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => ClassReference;
                IDictionary: (
                    keyType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type,
                    valueType: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => ClassReference;
            };
            Linq: { Enumerable: ClassReference };
        };
        Globalization: { DateTimeStyles: ClassReference };
        Linq: { Enumerable: ClassReference };
        Net: {
            Http: { HttpClient: ClassReference; HttpMethod: ClassReference; HttpResponseHeaders: ClassReference };
            ServerSentEvents: { SseEvent: ClassReference; SseParser: ClassReference };
            WebSockets: { ClientWebSocketOptions: ClassReference };
        };
        IO: { MemoryStream: ClassReference; Stream: ClassReference; StreamReader: ClassReference };
        Text: {
            Encoding: ClassReference;
            Encoding_UTF8: ClassReference;
            Json: {
                JsonElement: ClassReference;
                JsonDocument: ClassReference;
                JsonException: ClassReference;
                Utf8JsonReader: ClassReference;
                JsonSerializerOptions: ClassReference;
                JsonSerializer: ClassReference;
                Utf8JsonWriter: ClassReference;
                Nodes: { JsonNode: ClassReference; JsonObject: ClassReference };
                Serialization: {
                    IJsonOnDeserialized: ClassReference;
                    IJsonOnSerializing: ClassReference;
                    JsonOnDeserializedAttribute: ClassReference;
                    JsonExtensionData: ClassReference;
                    JsonConverter: (
                        typeToConvert?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                    ) => ClassReference;
                    JsonIgnore: ClassReference;
                    JsonPropertyName: ClassReference;
                };
            };
        };
        Threading: {
            CancellationToken: ClassReference;
            Tasks: {
                Task: (
                    ofType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => ClassReference;
                ValueTask: (
                    ofType?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type
                ) => ClassReference;
            };
        };
        ComponentModel: { INotifyPropertyChanged: ClassReference; PropertyChangedEventHandler: ClassReference };
        IAsyncDisposable: ClassReference;
        IDisposable: ClassReference;
    } {
        return this.generation.extern.System;
    }
    protected get NUnit(): {
        Framework: {
            TestFixture: ClassReference;
            Test: ClassReference;
            OneTimeTearDown: ClassReference;
            OneTimeSetUp: ClassReference;
            SetUpFixture: ClassReference;
        };
    } {
        return this.generation.extern.NUnit;
    }
    protected get OneOf(): {
        OneOf: (
            generics?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type[]
        ) => ClassReference;
        OneOfBase: (
            generics?: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/index").Type[]
        ) => ClassReference;
    } {
        return this.generation.extern.OneOf;
    }
    protected get Google(): {
        Protobuf: {
            WellKnownTypes: {
                Struct: ClassReference;
                Value: ClassReference;
                ListValue: ClassReference;
                Timestamp: ClassReference;
            };
        };
    } {
        return this.generation.extern.Google;
    }
    protected get WireMock(): {
        Server: ClassReference;
        WireMockServerSettings: ClassReference;
        WireMockConsoleLogger: ClassReference;
    } {
        return this.generation.extern.WireMock;
    }
    protected get Primitive(): {
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
    protected get Value(): {
        binary: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Value.Binary;
        dateOnly: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Value.DateOnly;
        dateTime: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Value.DateTime;
        uuid: import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Value.Uuid;
        stringEnum: (
            value: ClassReference
        ) => import("/home/ubuntu/repos/fern/generators/csharp/codegen/src/ast/types/Type").Value.StringEnum;
    } {
        return this.generation.Value;
    }
    protected get Collection(): {
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

    /**
     * Writes the node to a string.
     */
    public override toString({
        namespace,
        allNamespaceSegments,
        allTypeClassReferences,
        generation,
        formatter,
        skipImports = false
    }: {
        namespace: string;
        allNamespaceSegments: Set<string>;
        allTypeClassReferences: Map<string, Set<Namespace>>;
        generation: Generation;
        formatter?: AbstractFormatter;
        skipImports?: boolean;
    }): string {
        const writer = new Writer({
            namespace,
            allNamespaceSegments,
            allTypeClassReferences,
            generation,
            skipImports
        });
        this.write(writer);
        const stringNode = writer.toString(skipImports);
        return formatter != null ? formatter.formatSync(stringNode) : stringNode;
    }
    public toStringAsync({
        namespace,
        allNamespaceSegments,
        allTypeClassReferences,
        generation,
        formatter,
        skipImports = false
    }: {
        namespace: string;
        allNamespaceSegments: Set<string>;
        allTypeClassReferences: Map<string, Set<Namespace>>;
        generation: Generation;
        formatter?: AbstractFormatter;
        skipImports?: boolean;
    }): Promise<string> {
        const writer = new Writer({
            namespace,
            allNamespaceSegments,
            allTypeClassReferences,
            generation,
            skipImports
        });
        this.write(writer);
        const stringNode = writer.toString(skipImports);
        return formatter != null ? formatter.format(stringNode) : Promise.resolve(stringNode);
    }

    public toFormattedSnippet({
        allNamespaceSegments,
        allTypeClassReferences,
        generation,
        formatter,
        skipImports = false
    }: {
        allNamespaceSegments: Set<string>;
        allTypeClassReferences: Map<string, Set<Namespace>>;
        generation: Generation;
        formatter: AbstractFormatter;
        skipImports: boolean;
    }): FormattedAstNodeSnippet {
        const writer = new Writer({
            namespace: "",
            allNamespaceSegments,
            allTypeClassReferences,
            generation,
            skipImports
        });
        this.write(writer);
        return {
            imports: writer.importsToString(),
            body: formatter.formatSync(writer.buffer)
        };
    }

    public async toFormattedSnippetAsync({
        allNamespaceSegments,
        allTypeClassReferences,
        generation,
        formatter,
        skipImports = false
    }: {
        allNamespaceSegments: Set<string>;
        allTypeClassReferences: Map<string, Set<Namespace>>;
        generation: Generation;
        formatter: AbstractFormatter;
        skipImports?: boolean;
    }): Promise<FormattedAstNodeSnippet> {
        const writer = new Writer({
            namespace: "",
            allNamespaceSegments,
            allTypeClassReferences,
            generation,
            skipImports
        });
        this.write(writer);
        return {
            imports: writer.importsToString(),
            body: await formatter.format(writer.buffer)
        };
    }

    public get debugInfo(): string {
        return enableStackTracking
            ? `Debug Info:\n    at:\n    ${at({ multiline: true }).replaceAll("\n", "\n    ")}\n    creation stack:\n${getFramesForTaggedObject(
                  this
              )
                  .map((each) => `    ${each.fn} - ${each.path}:${each.position}`)
                  .join("\n")}`
            : "";
    }
}

export namespace Node {
    export interface Args {
        origin?: Origin;
    }
}

export abstract class Node extends AstNode {
    public readonly origin?: Origin;
    constructor(origin: Origin | undefined, generation: Generation) {
        super(generation);
        this.origin = this.model.origin(origin);
    }
}

export namespace MemberNode {
    export interface Args extends Node.Args {
        enclosingType?: Class | Interface | ClassReference;
    }
}
//
export abstract class MemberNode extends Node {
    public readonly enclosingType?: Class | Interface | ClassReference;

    constructor(args: MemberNode.Args, origin: Origin | undefined, generation: Generation) {
        super(origin, generation);
        this.enclosingType = args.enclosingType;
    }
}
