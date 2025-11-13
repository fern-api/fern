import { fail } from "node:assert";
import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { ast, CsharpConfigSchema, Generation } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import {
    DeclaredErrorName,
    EnumTypeDeclaration,
    ExampleEndpointCall,
    FernFilepath,
    HttpEndpoint,
    HttpHeader,
    HttpService,
    IntermediateRepresentation,
    Name,
    ObjectPropertyAccess,
    ObjectTypeDeclaration,
    PrimitiveType,
    PrimitiveTypeV1,
    ProtobufService,
    ServiceId,
    Subpackage,
    TypeDeclaration,
    TypeId,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { AsIsFiles } from "../AsIs";
import { GrpcClientInfo } from "../grpc/GrpcClientInfo";
import { CsharpProject } from "../project";
import { CORE_DIRECTORY_NAME, PUBLIC_CORE_DIRECTORY_NAME } from "../project/CsharpProject";
import { CsharpProtobufTypeMapper } from "../proto/CsharpProtobufTypeMapper";
import { ProtobufResolver } from "../proto/ProtobufResolver";
import { CsharpTypeMapper } from "./CsharpTypeMapper";

type Namespace = string;

export abstract class GeneratorContext extends AbstractGeneratorContext {
    public publishConfig: FernGeneratorExec.NugetGithubPublishInfo | undefined;
    public readonly project: CsharpProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        config: FernGeneratorExec.config.GeneratorConfig,
        protected readonly customConfig: CsharpConfigSchema,
        generatorNotificationService: GeneratorNotificationService,
        public readonly generation: Generation
    ) {
        super(config, generatorNotificationService);
        this.project = new CsharpProject({
            context: this,
            name: this.generation.namespaces.root
        });

        config.output.mode._visit<void>({
            github: (github) => {
                if (github.publishInfo?.type === "nuget") {
                    this.publishConfig = github.publishInfo;
                }
            },
            publish: () => undefined,
            downloadFiles: () => undefined,
            _other: () => undefined
        });

        this.csharpTypeMapper = new CsharpTypeMapper(this);
        this.csharpProtobufTypeMapper = new CsharpProtobufTypeMapper(this);
        this.protobufResolver = new ProtobufResolver(this, this.csharpTypeMapper);

        this.readOnlyMemoryTypes = new Set<PrimitiveTypeV1>(
            ast.convertReadOnlyPrimitiveTypes(this.settings.readOnlyMemoryTypes)
        );
    }

    private allNamespaceSegments?: Set<string>;
    private allTypeClassReferences?: Map<string, Set<Namespace>>;
    private readOnlyMemoryTypes: Set<PrimitiveTypeV1>;

    /** Provides access to C# code generation utilities */
    public get csharp() {
        return this.generation.csharp;
    }

    /** Provides access to generation settings and configuration */
    public get settings() {
        return this.generation.settings;
    }

    /** Provides access to generation constants */
    public get constants() {
        return this.generation.constants;
    }

    /** Provides access to namespace management utilities */
    public get namespaces() {
        return this.generation.namespaces;
    }

    /** Provides access to naming utilities for generating consistent identifiers */
    public get names() {
        return this.generation.names;
    }

    /** Provides access to the model navigation and inspection utilities */
    public get model() {
        return this.generation.model;
    }
    /** Provides access to text formatting utilities */
    public get format() {
        return this.generation.format;
    }

    /** Provides access to the type registry for looking up generated types */
    public get registry() {
        return this.generation.registry;
    }
    /** Provides access to type information and utilities */
    public get Types() {
        return this.generation.Types;
    }

    /** Provides access to .NET System namespace types and utilities */
    public get System() {
        return this.generation.extern.System;
    }

    /** Provides access to NUnit testing framework types */
    public get NUnit() {
        return this.generation.extern.NUnit;
    }

    /** Provides access to OneOf discriminated union library types */
    public get OneOf() {
        return this.generation.extern.OneOf;
    }

    /** Provides access to Google protocol buffer types */
    public get Google() {
        return this.generation.extern.Google;
    }
    public get Grpc() {
        return this.generation.extern.Grpc;
    }
    /** Provides access to WireMock.Net testing/mocking library types */
    public get WireMock() {
        return this.generation.extern.WireMock;
    }
    /** Provides access to primitive types */
    public get Primitive() {
        return this.generation.Primitive;
    }
    /** Provides access to value types */
    public get Value() {
        return this.generation.Value;
    }
    /** Provides access to collection types */
    public get Collection() {
        return this.generation.Collection;
    }

    public readonly csharpTypeMapper: CsharpTypeMapper;
    public readonly csharpProtobufTypeMapper: CsharpProtobufTypeMapper;
    public readonly protobufResolver: ProtobufResolver;

    public hasGrpcEndpoints(): boolean {
        // TODO: Replace this with the this.ir.sdkConfig.hasGrpcEndpoints property (when available).
        return Object.values(this.ir.services).some((service) => service.transport?.type === "grpc");
    }

    public getIdempotencyHeaders(): HttpHeader[] {
        return this.ir.idempotencyHeaders;
    }
    public hasIdempotencyHeaders(): boolean {
        return this.getIdempotencyHeaders().length > 0;
    }

    public getCoreDirectory(): RelativeFilePath {
        return RelativeFilePath.of(CORE_DIRECTORY_NAME);
    }

    public getPublicCoreDirectory(): RelativeFilePath {
        return join(this.getCoreDirectory(), RelativeFilePath.of(PUBLIC_CORE_DIRECTORY_NAME));
    }

    public getAsIsTestUtils(): string[] {
        return Object.values(AsIsFiles.Test.Utils);
    }

    public getRawAsIsFiles(): string[] {
        return [AsIsFiles.EditorConfig, AsIsFiles.GitIgnore];
    }

    public shouldCreateCustomPagination(): boolean {
        return false;
    }

    public getIdempotencyFields(clsOrInterface: ast.Class | ast.Interface, useRequired: boolean = true): void {
        for (const header of this.getIdempotencyHeaders()) {
            const type = this.csharpTypeMapper.convert({ reference: header.valueType });
            clsOrInterface.addField({
                origin: header,
                enclosingType: clsOrInterface,
                access: ast.Access.Public,
                get: true,
                init: true,
                useRequired: useRequired && type.isReferenceType && !type.isOptional,
                type,
                summary: header.docs
            });
        }
    }

    public getIdempotencyInitializers(writer: ast.Writer) {
        for (const header of this.getIdempotencyHeaders()) {
            const type = this.csharpTypeMapper.convert({ reference: header.valueType });

            if (type.isReferenceType && !type.isOptional) {
                const name = header.name.name.pascalCase.safeName;
                writer.write(name, " = ", type.defaultValue, ",");
                writer.writeLine();
            }
        }
    }

    public get hasWebSocketEndpoints(): boolean {
        return this.settings.enableWebsockets && Object.entries(this.ir.websocketChannels ?? {}).length > 0;
    }

    /**
     * Checks if the endpoint has an SSE streaming result.
     * @param endpoint - The endpoint to check.
     * @returns True if the endpoint has an SSE streaming result, false otherwise.
     */
    public endpointHasSseStreamingResult(endpoint: HttpEndpoint): boolean {
        return (
            endpoint.response?.body?._visit({
                streaming: (svc) =>
                    svc._visit({
                        json: () => false,
                        text: () => false,
                        sse: () => true,
                        _other: () => false
                    }),
                json: () => false,
                fileDownload: () => false,
                text: () => false,
                bytes: () => false,
                streamParameter: () => false,
                _other: () => false
            }) ?? false
        );
    }

    /**
     * Checks if the endpoint has a JSON streaming result.
     * @param endpoint - The endpoint to check.
     * @returns True if the endpoint has an SSE streaming result, false otherwise.
     */
    public endpointHasJsonStreamingResult(endpoint: HttpEndpoint): boolean {
        return (
            endpoint.response?.body?._visit({
                streaming: (svc) =>
                    svc._visit({
                        json: () => true,
                        text: () => false,
                        sse: () => false,
                        _other: () => false
                    }),
                json: () => false,
                fileDownload: () => false,
                text: () => false,
                bytes: () => false,
                streamParameter: () => false,
                _other: () => false
            }) ?? false
        );
    }

    /**
     * Checks if the API has any JSON streaming endpoints. ()
     * @returns True if the API has any JSON streaming endpoints, false otherwise.
     */
    public get hasJsonStreamingEndpoints(): boolean {
        return Object.values(this.ir.services).some((service) =>
            service.endpoints.some((endpoint) => this.endpointHasJsonStreamingResult(endpoint))
        );
    }

    /**
     * Checks if the API has any SSE endpoints.
     * @returns True if the API has any SSE endpoints, false otherwise.
     */
    public get hasSseEndpoints(): boolean {
        return Object.values(this.ir.services).some((service) =>
            service.endpoints.some((endpoint) => this.endpointHasSseStreamingResult(endpoint))
        );
    }

    public getWebsocketChannel(name?: string) {
        return name ? this.ir.websocketChannels?.[name] : undefined;
    }

    public getAllNamespaceSegments(): Set<string> {
        if (this.allNamespaceSegments == null) {
            this.allNamespaceSegments = new Set(
                Object.values(this.ir.subpackages).flatMap((subpackage) =>
                    this.getFullNamespaceSegments(subpackage.fernFilepath)
                )
            );
        }
        return this.allNamespaceSegments;
    }

    public getAllTypeClassReferences(): Map<string, Set<Namespace>> {
        if (this.allTypeClassReferences == null) {
            const resultMap = new Map<string, Set<string>>();
            Object.values(this.ir.types).forEach((typeDeclaration) => {
                const classReference = this.csharpTypeMapper.convertToClassReference(typeDeclaration);
                const key = classReference.name;
                const value = classReference.namespace;

                if (!resultMap.has(key)) {
                    resultMap.set(key, new Set<string>());
                }

                resultMap.get(key)?.add(value);
            });
            this.allTypeClassReferences = resultMap;
        }
        return this.allTypeClassReferences;
    }

    public getNamespaceFromFernFilepath(fernFilepath: FernFilepath): string {
        return this.getFullNamespaceSegments(fernFilepath).join(".");
    }

    public getFullNamespaceSegments(fernFilepath: FernFilepath): string[] {
        return [this.namespaces.root, ...this.getChildNamespaceSegments(fernFilepath)];
    }

    public abstract getChildNamespaceSegments(fernFilepath: FernFilepath): string[];

    public createJsonAccessAttribute(propertyAccess: ObjectPropertyAccess): ast.Annotation {
        let argument: string;
        switch (propertyAccess) {
            case "READ_ONLY":
                argument = "JsonAccessType.ReadOnly";
                break;
            case "WRITE_ONLY":
                argument = "JsonAccessType.WriteOnly";
                break;
            default:
                assertNever(propertyAccess);
        }
        return this.csharp.annotation({
            reference: this.csharp.classReference({
                origin: this.model.staticExplicit("JsonAccess"),
                namespace: this.namespaces.core
            }),
            argument
        });
    }

    public createJsonPropertyNameAttribute(name: string): ast.Annotation {
        return this.csharp.annotation({
            reference: this.System.Text.Json.Serialization.JsonPropertyName,
            argument: `"${name}"`
        });
    }

    public getCurrentVersionValueAccess(): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.writeNode(this.Types.Version);
            writer.write(".");
            writer.write(this.model.getPropertyNameFor(this.Types.Version.explicit("Current")));
        });
    }

    public getEnumerableEmptyKeyValuePairsInitializer(): ast.MethodInvocation {
        return this.csharp.invokeMethod({
            on: this.System.Linq.Enumerable,
            method: "Empty",
            generics: [this.System.Collections.Generic.KeyValuePair(this.Primitive.string, this.Primitive.string)],
            arguments_: []
        });
    }

    public getAsUndiscriminatedUnionTypeDeclaration(
        reference: TypeReference
    ): { declaration: UndiscriminatedUnionTypeDeclaration; isList: boolean } | undefined {
        if (reference.type === "container") {
            if (reference.container.type === "optional") {
                return this.getAsUndiscriminatedUnionTypeDeclaration(reference.container.optional);
            }
            if (reference.container.type === "nullable") {
                return this.getAsUndiscriminatedUnionTypeDeclaration(reference.container.nullable);
            }
            if (reference.container.type === "list") {
                const maybeDeclaration = this.getAsUndiscriminatedUnionTypeDeclaration(reference.container.list);
                if (maybeDeclaration != null) {
                    return {
                        ...maybeDeclaration,
                        isList: true
                    };
                }
            }
        }
        if (reference.type !== "named") {
            return undefined;
        }

        const declaration = this.model.dereferenceType(reference.typeId).typeDeclaration;
        if (this.protobufResolver.isWellKnownProtobufType(declaration.name.typeId)) {
            return undefined;
        }

        if (declaration.shape.type === "undiscriminatedUnion") {
            return { declaration: declaration.shape, isList: false };
        }

        // handle aliases by visiting resolved types
        if (declaration.shape.type === "alias") {
            const resolvedType = declaration.shape.resolvedType;
            if (resolvedType.type === "named") {
                const resolvedTypeDeclaration = this.model.dereferenceType(reference.typeId).typeDeclaration;
                if (resolvedTypeDeclaration.shape.type === "undiscriminatedUnion") {
                    return { declaration: resolvedTypeDeclaration.shape, isList: false };
                }
            }
            if (resolvedType.type === "container") {
                if (resolvedType.container.type === "optional") {
                    return this.getAsUndiscriminatedUnionTypeDeclaration(resolvedType.container.optional);
                }
                if (resolvedType.container.type === "nullable") {
                    return this.getAsUndiscriminatedUnionTypeDeclaration(resolvedType.container.nullable);
                }
            }
        }

        return undefined;
    }

    public getToStringMethod(cls: ast.Class): ast.Method {
        return cls.addMethod({
            name: "ToString",
            access: ast.Access.Public,
            isAsync: false,

            override: true,
            parameters: [],
            return_: this.Primitive.string,
            doc: {
                inheritdoc: true
            },
            body: this.csharp.codeblock((writer) => {
                writer.write("return ");
                writer.writeNodeStatement(
                    this.csharp.invokeMethod({
                        on: this.Types.JsonUtils,
                        method: "Serialize",
                        arguments_: [this.csharp.codeblock("this")]
                    })
                );
            })
        });
    }

    public isNullable(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                return typeReference.container.type === "nullable";
        }
        return false;
    }

    public isOptional(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return true;
                }
                if (typeReference.container.type === "nullable") {
                    return this.isOptional(typeReference.container.nullable);
                }
                return false;
            case "named": {
                const typeDeclaration = this.model.dereferenceType(typeReference.typeId).typeDeclaration;
                if (typeDeclaration.shape.type === "alias") {
                    return this.isOptional(typeDeclaration.shape.aliasOf);
                }
                return false;
            }
            case "unknown":
                return false;
            case "primitive":
                return false;
        }
    }

    public isPrimitive(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return this.isPrimitive(typeReference.container.optional);
                }
                if (typeReference.container.type === "nullable") {
                    return this.isPrimitive(typeReference.container.nullable);
                }
                return false;
            case "named": {
                const typeDeclaration = this.model.dereferenceType(typeReference.typeId).typeDeclaration;
                if (typeDeclaration.shape.type === "alias") {
                    return this.isPrimitive(typeDeclaration.shape.aliasOf);
                }
                return false;
            }
            case "unknown":
                return false;
            case "primitive":
                return true;
        }
    }

    public isReadOnlyMemoryType(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                return false;
            case "named": {
                const typeDeclaration = this.model.dereferenceType(typeReference.typeId).typeDeclaration;
                if (typeDeclaration.shape.type === "alias") {
                    return this.isReadOnlyMemoryType(typeDeclaration.shape.aliasOf);
                }
                return false;
            }
            case "unknown":
                return false;
            case "primitive":
                return this.readOnlyMemoryTypes.has(typeReference.primitive.v1) ?? false;
        }
    }

    public getDefaultValueForPrimitive({ primitive }: { primitive: PrimitiveType }): ast.CodeBlock {
        return PrimitiveTypeV1._visit<ast.CodeBlock>(primitive.v1, {
            integer: () => this.csharp.codeblock("0"),
            long: () => this.csharp.codeblock("0"),
            uint: () => this.csharp.codeblock("0"),
            uint64: () => this.csharp.codeblock("0"),
            float: () => this.csharp.codeblock("0.0f"),
            double: () => this.csharp.codeblock("0.0"),
            boolean: () => this.csharp.codeblock("false"),
            string: () => this.csharp.codeblock('""'),
            date: () => this.csharp.codeblock("DateOnly.MinValue"),
            dateTime: () => this.csharp.codeblock("DateTime.MinValue"),
            uuid: () => this.csharp.codeblock('""'),
            base64: () => this.csharp.codeblock('""'),
            bigInteger: () => this.csharp.codeblock('""'),
            _other: () => this.csharp.codeblock("null")
        });
    }

    /**
     * Prints the Type in a simple string format.
     */
    public printType(type: ast.Type): string {
        return type.toString({
            namespace: this.namespaces.root,
            allNamespaceSegments: this.getAllNamespaceSegments(),
            allTypeClassReferences: this.getAllTypeClassReferences(),
            generation: this.generation,
            skipImports: true
        });
    }

    /**
     * Returns the literal value from a Type Reference (doesn't unbox containers to find a literal).
     */
    public getLiteralInitializerFromTypeReference({
        typeReference
    }: {
        typeReference: TypeReference;
    }): ast.CodeBlock | undefined {
        const literalValue = this.getLiteralValue(typeReference);
        if (literalValue != null) {
            return this.csharp.codeblock(
                typeof literalValue === "boolean"
                    ? `${literalValue.toString().toLowerCase()}`
                    : this.csharp.string_({ string: literalValue })
            );
        }
        return undefined;
    }

    private getLiteralValue(typeReference: TypeReference): string | boolean | undefined {
        if (typeReference.type === "container" && typeReference.container.type === "literal") {
            const literal = typeReference.container.literal;
            switch (literal.type) {
                case "string":
                    return literal.string;
                case "boolean":
                    return literal.boolean;
                default:
                    return undefined;
            }
        }
        if (typeReference.type === "named") {
            const typeDeclaration = this.model.dereferenceType(typeReference.typeId).typeDeclaration;
            if (
                typeDeclaration.shape.type === "alias" &&
                typeDeclaration.shape.resolvedType.type === "container" &&
                typeDeclaration.shape.resolvedType.container.type === "literal"
            ) {
                const literal = typeDeclaration.shape.resolvedType.container.literal;
                switch (literal.type) {
                    case "string":
                        return literal.string;
                    case "boolean":
                        return literal.boolean;
                    default:
                        return undefined;
                }
            }
        }
        return undefined;
    }

    public invokeCustomPagerFactoryMethod({
        itemType,
        sendRequestMethod,
        initialRequest,
        clientOptions,
        requestOptions,
        cancellationToken
    }: {
        itemType: ast.Type;
        sendRequestMethod: ast.CodeBlock;
        initialRequest: ast.CodeBlock;
        clientOptions: ast.CodeBlock;
        requestOptions: ast.CodeBlock;
        cancellationToken: ast.CodeBlock;
    }): ast.MethodInvocation {
        return this.csharp.invokeMethod({
            on: this.Types.CustomPagerFactory,
            method: "CreateAsync",
            async: true,
            arguments_: [
                this.csharp.instantiateClass({
                    classReference: this.Types.CustomPagerContext,
                    arguments_: [],
                    properties: [
                        {
                            name: "SendRequest",
                            value: sendRequestMethod
                        },
                        {
                            name: "InitialHttpRequest",
                            value: initialRequest
                        },
                        {
                            name: "ClientOptions",
                            value: clientOptions
                        },
                        {
                            name: "RequestOptions",
                            value: requestOptions
                        }
                    ]
                }),
                cancellationToken
            ],
            generics: [itemType]
        });
    }

    public abstract getCoreAsIsFiles(): string[];

    public abstract getCoreTestAsIsFiles(): string[];

    public abstract getPublicCoreAsIsFiles(): string[];

    public abstract getAsyncCoreAsIsFiles(): string[];

    public abstract getDirectoryForTypeId(typeId: TypeId): string;

    public abstract getNamespaceForTypeId(typeId: TypeId): string;

    public getSubpackageClassReference(subpackage: Subpackage): ast.ClassReference {
        return this.csharp.classReference({
            name: `${subpackage.name.pascalCase.unsafeName}Client`,
            namespace: this.getNamespaceFromFernFilepath(subpackage.fernFilepath),
            origin: subpackage
        });
    }

    /**
     * Returns the service with the given id
     * @param serviceId
     * @returns
     */
    public getHttpService(serviceId?: ServiceId): HttpService | undefined {
        return serviceId != null ? this.ir.services[serviceId] : undefined;
    }

    public getSubpackageForServiceId(serviceId: ServiceId): Subpackage | undefined {
        return Object.values(this.ir.subpackages).find((subpackage) => subpackage.service === serviceId);
    }

    public getSubpackageClassReferenceForServiceId(serviceId: ServiceId): ast.ClassReference {
        return this.getSubpackageClassReference(
            this.getSubpackageForServiceId(serviceId) ?? fail(`subpackage ${serviceId} not found`)
        );
    }

    public getNamespaceForServiceId(serviceId: ServiceId): string {
        return this.getNamespaceFromFernFilepath(
            this.getHttpService(serviceId)?.name.fernFilepath ?? fail(`Service with id ${serviceId} not found`)
        );
    }

    public getExceptionClassReference(declaredErrorName: DeclaredErrorName): ast.ClassReference {
        return this.csharp.classReference({
            origin: declaredErrorName,
            namespace: this.getNamespaceFromFernFilepath(declaredErrorName.fernFilepath)
        });
    }

    public getRequestWrapperReference(serviceId: ServiceId, requestName: Name): ast.ClassReference {
        return this.csharp.classReference({
            origin: requestName,
            namespace: this.getNamespaceForServiceId(serviceId)
        });
    }

    private getGrpcClientServiceName(protobufService: ProtobufService): string {
        return protobufService.name.originalName;
    }

    public getGrpcClientInfoForServiceId(serviceId: ServiceId): GrpcClientInfo | undefined {
        const protobufService = this.protobufResolver.getProtobufServiceForServiceId(serviceId);
        if (protobufService == null) {
            return undefined;
        }
        const serviceName = this.getGrpcClientServiceName(protobufService);
        return {
            privatePropertyName: `_${protobufService.name.camelCase.safeName}`,
            classReference: this.csharp.classReference({
                origin: protobufService,
                name: `${serviceName}.${serviceName}Client`,
                namespace: this.protobufResolver.getNamespaceFromProtobufFile(protobufService.file)
            }),
            protobufService
        };
    }

    precalculate() {
        this.System.Collections.Generic.KeyValuePair();
        this.System.Collections.Generic.IEnumerable();
        this.System.Collections.Generic.IAsyncEnumerable();
        this.System.Collections.Generic.HashSet();
        this.System.Collections.Generic.List();
        this.System.Collections.Generic.Dictionary();

        // types that can get used
        this.Types.ReadOnlyAdditionalProperties();
        this.Types.JsonUtils;
        this.Types.StringEnumSerializer;
        this.Types.IStringEnum;

        // start with the models
        for (const [typeId, typeDeclaration] of Object.entries(this.ir.types)) {
            if (this.protobufResolver.isWellKnownProtobufType(typeId)) {
                // The well-known Protobuf types are generated separately.
                continue;
            }

            const result = typeDeclaration.shape._visit({
                alias: () => undefined,
                undiscriminatedUnion: () => undefined,
                _other: () => undefined,

                enum: (etd: EnumTypeDeclaration) => {
                    const enclosingType = this.csharpTypeMapper.convertToClassReference(typeDeclaration);

                    if (this.settings.isForwardCompatibleEnumsEnabled) {
                        // we're generating a string enum
                        // it's going to be a class called Values

                        this.csharp.classReference({
                            origin: this.model.explicit(typeDeclaration, "Values"),
                            enclosingType
                        });
                    }
                },
                object: (otd: ObjectTypeDeclaration) => {
                    // generate a class reference for the typedeclaration

                    this.csharpTypeMapper.convertToClassReference(typeDeclaration);

                    for (const property of otd.properties) {
                        switch (property.valueType.type) {
                            case "named":
                                {
                                    this.csharpTypeMapper.convertToClassReference(property.valueType);

                                    const typeDeclaration = this.model.dereferenceType(
                                        property.valueType.typeId
                                    ).typeDeclaration;
                                    switch (typeDeclaration.shape.type) {
                                        case "alias":
                                            break;
                                        case "enum":
                                            break;
                                        case "object":
                                            break;
                                        case "union":
                                            break;
                                        case "undiscriminatedUnion":
                                            typeDeclaration.shape.members.map((member) => {
                                                switch (member.type.type) {
                                                    case "named":
                                                        this.csharpTypeMapper.convertToClassReference(member.type);
                                                        break;
                                                    case "primitive":
                                                        break;
                                                    case "container":
                                                        break;
                                                }
                                            });
                                            break;
                                    }
                                }
                                break;
                            case "primitive":
                                break;
                            case "container":
                                switch (property.valueType.container.type) {
                                    case "list":
                                        break;
                                    case "map":
                                        break;
                                    case "set":
                                        break;
                                    case "optional":
                                        switch (property.valueType.container.optional.type) {
                                            case "named":
                                                this.csharpTypeMapper.convertToClassReference(
                                                    property.valueType.container.optional
                                                );
                                                break;
                                            case "primitive":
                                                break;
                                            case "container":
                                                break;
                                        }

                                        break;
                                    case "nullable":
                                        break;
                                    case "literal":
                                        break;
                                }
                                break;
                            case "unknown":
                                break;
                        }
                    }
                },
                union: (utd: UnionTypeDeclaration) => {
                    if (this.settings.shouldGeneratedDiscriminatedUnions) {
                        const enclosingType = this.csharpTypeMapper.convertToClassReference(typeDeclaration);

                        utd.types.map((type) => {
                            type.discriminantValue.name.pascalCase.safeName;

                            this.csharp.classReference({
                                origin: type.discriminantValue,
                                enclosingType
                            });
                        });

                        this.csharp.classReference({
                            origin: this.model.explicit(typeDeclaration, "JsonConverter"),
                            enclosingType
                        });

                        if (utd.baseProperties.length > 0) {
                            this.csharp.classReference({
                                enclosingType,
                                name: "BaseProperties"
                            });
                        }
                    }
                }
            });
            if (result !== undefined) {
                throw new Error(`Unexpected result from typeDeclaration.shape._visit: ${result}`);
            }
        }

        Object.values(this.ir.types).forEach((typeDeclaration) => {
            this.csharpTypeMapper.convertToClassReference(typeDeclaration);
        });

        const initialClassReferences = [
            this.Types.RawClient,
            this.Types.RequestOptions,
            this.Types.RequestOptionsInterface,
            this.Types.ClientOptions,
            this.Types.JsonRequest,
            this.Types.Version,
            this.Types.ValueConvert,
            this.Types.BaseException,
            this.Types.RootClient,
            this.Types.RootClientForSnippets,
            this.Types.BaseApiException,
            this.Types.Headers,
            this.Types.Environments,
            this.Types.TestClient
        ];

        // subpackages
        Object.entries(this.ir.subpackages).forEach(([_, subpackage]) => {
            // generate the subpackage class references
            this.getSubpackageClassReference(subpackage);
            if (subpackage.service) {
                const service = this.getHttpService(subpackage.service);
                for (const endpoint of service?.endpoints ?? []) {
                    endpoint.sdkRequest?.shape._visit({
                        wrapper: (wrapper) => {
                            if (wrapper.wrapperName && subpackage.service) {
                                const requestWrapperReference = this.getRequestWrapperReference(
                                    subpackage.service,
                                    wrapper.wrapperName
                                );
                            }
                        },
                        justRequestBody: (value) => {
                            // no-op
                        },
                        _other: (value) => {
                            // no-op
                        }
                    });
                }
            }

            // examples generation
            const types = Object.entries(this.ir.types)
                .filter(([typeId, _]) => !this.protobufResolver.isWellKnownProtobufType(typeId))
                .map(([_, type]) => type);

            for (const typeDeclaration of types
                .filter((type) => type.shape.type === "object")
                .map((type) => type as TypeDeclaration & { shape: ObjectTypeDeclaration })) {
                const examples = [...typeDeclaration.userProvidedExamples, ...typeDeclaration.autogeneratedExamples];
                if (examples.length === 0) {
                    continue;
                }

                const testType = this.csharp.classReference({
                    origin: this.model.explicit(typeDeclaration, "Test"),
                    name: `${this.csharpTypeMapper.convertToClassReference(typeDeclaration).name}Test`,
                    namespace: this.namespaces.test
                });
            }

            if (this.settings.shouldGeneratedDiscriminatedUnions) {
                for (const typeDeclaration of types
                    .filter((type) => type.shape.type === "union")
                    .map((type) => type as TypeDeclaration & { shape: UnionTypeDeclaration })) {
                    const examples = [
                        ...typeDeclaration.userProvidedExamples,
                        ...typeDeclaration.autogeneratedExamples
                    ];
                    if (examples.length === 0) {
                        continue;
                    }
                    const testType = this.csharp.classReference({
                        name: `${this.csharpTypeMapper.convertToClassReference(typeDeclaration).name}Test`,
                        namespace: this.namespaces.test
                    });
                }
            }

            if (this.settings.generateErrorTypes) {
                for (const each of Object.values(this.ir.errors)) {
                    this.getExceptionClassReference(each.name);
                }
            }
        });

        for (const [serviceId, service] of Object.entries(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                const allExamples = [...endpoint.autogeneratedExamples, ...endpoint.userSpecifiedExamples].map(
                    (example) => example.example
                );
                // TODO: support other response body types
                const useableExamples = allExamples.filter((example): example is ExampleEndpointCall => {
                    const response = example?.response;
                    return response?.type === "ok" && response.value.type === "body";
                });
                if (useableExamples.length === 0) {
                    // this.support.getLogger().warn(`No useable examples found for endpoint ${endpoint.id}`);
                    continue;
                }

                this.csharp.classReference({
                    origin: this.model.explicit(endpoint, "Test"),
                    name: `${endpoint.name.pascalCase.safeName}Test`,

                    namespace: this.namespaces.test
                });
            }
        }

        // after generating the names for everything, freeze the class references
        this.csharp.freezeClassReferences();
    }
}
