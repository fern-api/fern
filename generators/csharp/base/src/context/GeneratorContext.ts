import { fail } from "node:assert";
import {
    AbstractFormatter,
    AbstractGeneratorContext,
    CaseConverter,
    FernGeneratorExec,
    GeneratorNotificationService,
    getOriginalName
} from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { ast, CsharpConfigSchema, Generation } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

type DeclaredErrorName = FernIr.DeclaredErrorName;
type EnumTypeDeclaration = FernIr.EnumTypeDeclaration;
type ExampleEndpointCall = FernIr.ExampleEndpointCall;
type FernFilepath = FernIr.FernFilepath;
type HttpEndpoint = FernIr.HttpEndpoint;
type HttpHeader = FernIr.HttpHeader;
type HttpService = FernIr.HttpService;
type IntermediateRepresentation = FernIr.IntermediateRepresentation;
type Name = FernIr.Name;
type ObjectPropertyAccess = FernIr.ObjectPropertyAccess;
type ObjectTypeDeclaration = FernIr.ObjectTypeDeclaration;
type PrimitiveType = FernIr.PrimitiveType;
type PrimitiveTypeV1 = FernIr.PrimitiveTypeV1;
const PrimitiveTypeV1 = FernIr.PrimitiveTypeV1;
type ProtobufService = FernIr.ProtobufService;
type ServiceId = FernIr.ServiceId;
type Subpackage = FernIr.Subpackage;
type TypeDeclaration = FernIr.TypeDeclaration;
type TypeId = FernIr.TypeId;
type TypeReference = FernIr.TypeReference;
type UndiscriminatedUnionTypeDeclaration = FernIr.UndiscriminatedUnionTypeDeclaration;
type UnionTypeDeclaration = FernIr.UnionTypeDeclaration;

import { AsIsFiles } from "../AsIs.js";
import { GrpcClientInfo } from "../grpc/GrpcClientInfo.js";
import { CORE_DIRECTORY_NAME, PUBLIC_CORE_DIRECTORY_NAME } from "../project/CsharpProject.js";
import { CsharpProject } from "../project/index.js";
import { CsharpProtobufTypeMapper } from "../proto/CsharpProtobufTypeMapper.js";
import { ProtobufResolver } from "../proto/ProtobufResolver.js";
import { CsharpTypeMapper } from "./CsharpTypeMapper.js";

type Namespace = string;

export abstract class GeneratorContext extends AbstractGeneratorContext {
    public publishConfig: FernGeneratorExec.NugetGithubPublishInfo | undefined;
    public readonly project: CsharpProject;
    public readonly case: CaseConverter;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        config: FernGeneratorExec.config.GeneratorConfig,
        protected readonly customConfig: CsharpConfigSchema,
        generatorNotificationService: GeneratorNotificationService,
        public readonly generation: Generation
    ) {
        super(config, generatorNotificationService);
        this.case = new CaseConverter({
            generationLanguage: "csharp",
            keywords: ir.casingsConfig?.keywords,
            smartCasing: ir.casingsConfig?.smartCasing ?? true
        });
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

        // Log deprecation warning if the old flag is used
        if (this.customConfig["experimental-readonly-constants"] === true) {
            this.logger.warn(
                'The "experimental-readonly-constants" option is deprecated. Use "generate-literals" instead.'
            );
        }
    }

    /**
     * Backing field for the lazily-initialized formatter.
     * Declared here so that sibling subclasses (SdkGeneratorContext,
     * ModelGeneratorContext) share a single property declaration and
     * remain structurally compatible in TypeScript.
     */
    protected _formatter: AbstractFormatter | undefined;

    private allNamespaceSegments?: Set<string>;
    private allTypeClassReferences?: Map<string, Set<Namespace>>;
    private readOnlyMemoryTypes: Set<PrimitiveTypeV1>;

    /**
     * Lazily-initialized map from inline typeId to its immediate parent typeId.
     * Built by scanning all type declarations' properties/members for references to inline types.
     */
    private _inlineTypeParentMap?: Map<TypeId, TypeId>;

    /**
     * Lazily-initialized map from parent typeId to the set of its direct inline child typeIds.
     */
    private _inlineTypeChildrenMap?: Map<TypeId, Set<TypeId>>;

    /** Provides access to C# code generation utilities */
    public get csharp(): Generation["csharp"] {
        return this.generation.csharp;
    }

    /** Provides access to generation settings and configuration */
    public get settings(): Generation["settings"] {
        return this.generation.settings;
    }

    /** Provides access to generation constants */
    public get constants(): Generation["constants"] {
        return this.generation.constants;
    }

    /** Provides access to namespace management utilities */
    public get namespaces(): Generation["namespaces"] {
        return this.generation.namespaces;
    }

    /** Provides access to naming utilities for generating consistent identifiers */
    public get names(): Generation["names"] {
        return this.generation.names;
    }

    /** Provides access to the model navigation and inspection utilities */
    public get model(): Generation["model"] {
        return this.generation.model;
    }
    /** Provides access to text formatting utilities */
    public get format(): Generation["format"] {
        return this.generation.format;
    }

    /** Provides access to the type registry for looking up generated types */
    public get registry(): Generation["registry"] {
        return this.generation.registry;
    }
    /** Provides access to type information and utilities */
    public get Types(): Generation["Types"] {
        return this.generation.Types;
    }

    /** Provides access to .NET System namespace types and utilities */
    public get System(): Generation["extern"]["System"] {
        return this.generation.extern.System;
    }

    /** Provides access to NUnit testing framework types */
    public get NUnit(): Generation["extern"]["NUnit"] {
        return this.generation.extern.NUnit;
    }

    /** Provides access to OneOf discriminated union library types */
    public get OneOf(): Generation["extern"]["OneOf"] {
        return this.generation.extern.OneOf;
    }

    /** Provides access to Google protocol buffer types */
    public get Google(): Generation["extern"]["Google"] {
        return this.generation.extern.Google;
    }
    public get Grpc(): Generation["extern"]["Grpc"] {
        return this.generation.extern.Grpc;
    }
    /** Provides access to WireMock.Net testing/mocking library types */
    public get WireMock(): Generation["extern"]["WireMock"] {
        return this.generation.extern.WireMock;
    }
    /** Provides access to primitive types */
    public get Primitive(): Generation["Primitive"] {
        return this.generation.Primitive;
    }
    /** Provides access to value types */
    public get Value(): Generation["Value"] {
        return this.generation.Value;
    }
    /** Provides access to collection types */
    public get Collection(): Generation["Collection"] {
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

    public hasBaseUrl(): boolean {
        return this.ir.environments?.environments.type !== "multipleBaseUrls";
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
                const name = this.case.pascalSafe(header.name);
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

            // Track API types
            Object.values(this.ir.types).forEach((typeDeclaration) => {
                const classReference = this.csharpTypeMapper.convertToClassReference(typeDeclaration);
                const key = classReference.name;
                const value = classReference.namespace;

                if (!resultMap.has(key)) {
                    resultMap.set(key, new Set<string>());
                }

                resultMap.get(key)?.add(value);
            });

            // Track subpackage interface references to detect collisions
            // (e.g., ITemplatesClient in multiple namespaces)
            Object.values(this.ir.subpackages).forEach((subpackage) => {
                const interfaceRef = this.getSubpackageInterfaceReference(subpackage);
                const key = interfaceRef.name;
                const value = interfaceRef.namespace;

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

    public createJsonAccessAttribute(propertyAccess: FernIr.ObjectPropertyAccess): ast.Annotation {
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
                origin: this.model.staticExplicit("JsonAccessAttribute"),
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

    public createOptionalAttribute(): ast.Annotation {
        return this.csharp.annotation({
            reference: this.csharp.classReference({
                origin: this.model.staticExplicit("OptionalAttribute"),
                namespace: this.namespaces.core
            })
        });
    }

    public createNullableAttribute(): ast.Annotation {
        return this.csharp.annotation({
            reference: this.csharp.classReference({
                origin: this.model.staticExplicit("NullableAttribute"),
                namespace: this.namespaces.core
            })
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
                if (typeReference.container.type === "nullable") {
                    return true;
                }
                // Only check through optional wrapper if experimental flag is enabled
                if (this.settings.enableExplicitNullableOptional && typeReference.container.type === "optional") {
                    return this.isNullable(typeReference.container.optional);
                }
                return false;
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
        return FernIr.PrimitiveTypeV1._visit<ast.CodeBlock>(primitive.v1, {
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
            dateTimeRfc2822: () => this.csharp.codeblock("DateTime.MinValue"),
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

    public isLiteralValue(typeReference: TypeReference): boolean {
        return this.getLiteralValue(typeReference) != null;
    }

    public getLiteralValue(typeReference: TypeReference): string | boolean | undefined {
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
            name: `${this.case.pascalUnsafe(subpackage.name)}Client`,
            namespace: this.getNamespaceFromFernFilepath(subpackage.fernFilepath),
            origin: subpackage
        });
    }

    public getSubpackageInterfaceReference(subpackage: Subpackage): ast.ClassReference {
        return this.csharp.classReference({
            name: `I${this.case.pascalUnsafe(subpackage.name)}Client`,
            namespace: this.getNamespaceFromFernFilepath(subpackage.fernFilepath),
            origin: this.model.explicit(subpackage, "Interface")
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

    public getRequestWrapperReference(
        serviceId: ServiceId,
        wrapper: FernIr.SdkRequestWrapper | FernIr.InlinedRequestBody
    ): ast.ClassReference {
        const wrapperName = "wrapperName" in wrapper ? wrapper.wrapperName : wrapper.name;
        return this.csharp.classReference({
            name: this.case.pascalSafe(wrapperName),
            origin: wrapper,
            namespace: this.getNamespaceForServiceId(serviceId)
        });
    }

    private getGrpcClientServiceName(protobufService: ProtobufService): string {
        return getOriginalName(protobufService.name);
    }

    public getGrpcClientInfoForServiceId(serviceId: ServiceId): GrpcClientInfo | undefined {
        const protobufService = this.protobufResolver.getProtobufServiceForServiceId(serviceId);
        if (protobufService == null) {
            return undefined;
        }
        const serviceName = this.getGrpcClientServiceName(protobufService);
        return {
            privatePropertyName: `_${this.case.camelSafe(protobufService.name)}`,
            classReference: this.csharp.classReference({
                origin: protobufService,
                name: `${serviceName}.${serviceName}Client`,
                namespace: this.protobufResolver.getNamespaceFromProtobufFile(protobufService.file)
            }),
            protobufService
        };
    }

    /**
     * Extracts all named TypeIds referenced from a TypeReference,
     * recursing into containers (list, set, map, optional, nullable)
     * and following alias chains to find transitively-referenced types.
     */
    private extractNamedTypeIdsFromTypeReference(typeRef: TypeReference, visited?: Set<TypeId>): TypeId[] {
        switch (typeRef.type) {
            case "named": {
                const ids: TypeId[] = [typeRef.typeId];
                // Follow alias chains so that types referenced through aliases
                // are also discovered (needed for inline type parent assignment).
                // Track visited type IDs to prevent infinite recursion on circular aliases.
                const decl = this.ir.types[typeRef.typeId];
                if (decl?.shape.type === "alias") {
                    const visitedSet = visited ?? new Set<TypeId>();
                    if (!visitedSet.has(typeRef.typeId)) {
                        visitedSet.add(typeRef.typeId);
                        ids.push(...this.extractNamedTypeIdsFromTypeReference(decl.shape.aliasOf, visitedSet));
                    }
                }
                return ids;
            }
            case "container":
                switch (typeRef.container.type) {
                    case "list":
                        return this.extractNamedTypeIdsFromTypeReference(typeRef.container.list, visited);
                    case "set":
                        return this.extractNamedTypeIdsFromTypeReference(typeRef.container.set, visited);
                    case "map":
                        return [
                            ...this.extractNamedTypeIdsFromTypeReference(typeRef.container.keyType, visited),
                            ...this.extractNamedTypeIdsFromTypeReference(typeRef.container.valueType, visited)
                        ];
                    case "optional":
                        return this.extractNamedTypeIdsFromTypeReference(typeRef.container.optional, visited);
                    case "nullable":
                        return this.extractNamedTypeIdsFromTypeReference(typeRef.container.nullable, visited);
                    case "literal":
                        return [];
                    default:
                        return [];
                }
            case "primitive":
            case "unknown":
                return [];
            default:
                return [];
        }
    }

    /**
     * Builds the inline type parent and children maps by scanning all type declarations.
     * For each non-alias type, finds named references to inline types in its properties/members
     * (following alias chains). An inline type is only inlined if exactly one non-alias type
     * references it; otherwise it stays top-level to avoid broken cross-references.
     */
    private buildInlineTypeMaps(): void {
        if (this._inlineTypeParentMap != null) {
            return;
        }
        const parentMap = new Map<TypeId, TypeId>();
        const childrenMap = new Map<TypeId, Set<TypeId>>();

        // First pass: for each non-alias type, collect all inline types it references
        // (following alias chains). Track how many non-alias types reference each inline type.
        const inlineTypeReferencers = new Map<TypeId, Set<TypeId>>();

        for (const [typeId, typeDeclaration] of Object.entries(this.ir.types)) {
            // Skip alias types as potential parents since they don't generate class files.
            if (typeDeclaration.shape.type === "alias") {
                continue;
            }

            const referencedTypeIds: TypeId[] = [];

            typeDeclaration.shape._visit({
                alias: () => {
                    // Already filtered above, but required by visitor
                },
                object: (otd) => {
                    for (const property of [...otd.properties, ...(otd.extendedProperties ?? [])]) {
                        referencedTypeIds.push(...this.extractNamedTypeIdsFromTypeReference(property.valueType));
                    }
                },
                enum: () => {
                    // Enums don't reference other types
                },
                union: (utd) => {
                    for (const unionType of utd.types) {
                        unionType.shape._visit({
                            samePropertiesAsObject: (declaredTypeName) => {
                                referencedTypeIds.push(declaredTypeName.typeId);
                            },
                            singleProperty: (singleProperty) => {
                                referencedTypeIds.push(
                                    ...this.extractNamedTypeIdsFromTypeReference(singleProperty.type)
                                );
                            },
                            noProperties: () => {
                                // No-op: no types to reference
                            },
                            _other: () => {
                                // Unknown union types are ignored
                            }
                        });
                    }
                    for (const baseProp of utd.baseProperties) {
                        referencedTypeIds.push(...this.extractNamedTypeIdsFromTypeReference(baseProp.valueType));
                    }
                },
                undiscriminatedUnion: (uutd) => {
                    for (const member of uutd.members) {
                        referencedTypeIds.push(...this.extractNamedTypeIdsFromTypeReference(member.type));
                    }
                },
                _other: () => {
                    // Unknown shape types are ignored
                }
            });

            for (const refTypeId of referencedTypeIds) {
                const refDeclaration = this.ir.types[refTypeId];
                if (refDeclaration?.inline === true) {
                    if (!inlineTypeReferencers.has(refTypeId)) {
                        inlineTypeReferencers.set(refTypeId, new Set());
                    }
                    inlineTypeReferencers.get(refTypeId)?.add(typeId);
                }
            }
        }

        // Second pass: only inline types referenced by exactly one non-alias parent
        // can be safely nested. Types referenced by multiple parents stay top-level.
        for (const [inlineTypeId, referencers] of inlineTypeReferencers) {
            if (referencers.size === 1) {
                const parentTypeId = [...referencers][0];
                if (parentTypeId != null) {
                    parentMap.set(inlineTypeId, parentTypeId);
                    if (!childrenMap.has(parentTypeId)) {
                        childrenMap.set(parentTypeId, new Set());
                    }
                    childrenMap.get(parentTypeId)?.add(inlineTypeId);
                }
            }
        }

        // Third pass: validate that every parent in the chain will actually be generated
        // as a class file. If a parent is itself inline (in the IR) but has no parent in
        // the map (orphaned inline — e.g. only referenced from an endpoint request body),
        // then it won't be generated, so its children can't be nested inside it either.
        // Recursively remove such orphaned subtrees from the maps.
        const orphanedParents = new Set<TypeId>();
        for (const [inlineTypeId, parentTypeId] of parentMap) {
            let currentParent: TypeId | undefined = parentTypeId;
            const visitedInChain = new Set<TypeId>();
            while (currentParent != null) {
                if (visitedInChain.has(currentParent)) {
                    // Cycle detected — treat as orphaned since no non-inline root exists
                    orphanedParents.add(currentParent);
                    break;
                }
                visitedInChain.add(currentParent);
                const currentParentDeclaration = this.ir.types[currentParent];
                if (currentParentDeclaration?.inline === true && !parentMap.has(currentParent)) {
                    // This parent is inline but has no parent itself — it's orphaned
                    orphanedParents.add(currentParent);
                    break;
                }
                // Walk up the chain
                currentParent = parentMap.get(currentParent);
            }
        }

        if (orphanedParents.size > 0) {
            // Remove all inline types whose ancestor chain includes an orphaned parent
            const toRemove = new Set<TypeId>();
            const collectOrphanedDescendants = (typeId: TypeId) => {
                toRemove.add(typeId);
                const children = childrenMap.get(typeId);
                if (children) {
                    for (const childId of children) {
                        collectOrphanedDescendants(childId);
                    }
                }
            };
            for (const orphanedParent of orphanedParents) {
                // Also collect the orphaned parent itself so it is removed from the maps
                collectOrphanedDescendants(orphanedParent);
            }
            for (const typeId of toRemove) {
                const parent = parentMap.get(typeId);
                if (parent != null) {
                    childrenMap.get(parent)?.delete(typeId);
                }
                parentMap.delete(typeId);
                childrenMap.delete(typeId);
            }
        }

        this._inlineTypeParentMap = parentMap;
        this._inlineTypeChildrenMap = childrenMap;
    }

    /**
     * Returns the map from inline typeId to its immediate parent typeId.
     */
    public getInlineTypeParentMap(): Map<TypeId, TypeId> {
        this.buildInlineTypeMaps();
        // buildInlineTypeMaps always initializes the maps, so this is safe after the call
        return this._inlineTypeParentMap ?? new Map();
    }

    /**
     * Returns the map from parent typeId to the set of its direct inline child typeIds.
     */
    public getInlineTypeChildrenMap(): Map<TypeId, Set<TypeId>> {
        this.buildInlineTypeMaps();
        // buildInlineTypeMaps always initializes the maps, so this is safe after the call
        return this._inlineTypeChildrenMap ?? new Map();
    }

    /**
     * Returns true if the given typeId is an inline type AND the inline-types feature is enabled.
     */
    public isInlineType(typeId: TypeId): boolean {
        if (!this.settings.enableInlineTypes) {
            return false;
        }
        // A type is only treated as inline if it has a parent in the map.
        // Types marked inline in the IR but referenced by multiple non-alias parents
        // cannot be safely nested, so they stay top-level.
        return this.getInlineTypeParentMap().has(typeId);
    }

    /**
     * Returns the immediate parent typeId for an inline type, or undefined if not inline.
     */
    public getInlineTypeParent(typeId: TypeId): TypeId | undefined {
        if (!this.settings.enableInlineTypes) {
            return undefined;
        }
        return this.getInlineTypeParentMap().get(typeId);
    }

    /**
     * Returns the direct inline children of a type, or an empty set if none.
     */
    public getInlineTypeChildren(typeId: TypeId): Set<TypeId> {
        if (!this.settings.enableInlineTypes) {
            return new Set();
        }
        return this.getInlineTypeChildrenMap().get(typeId) ?? new Set();
    }

    /**
     * Returns the name to use for the static nested `Types` class inside a parent type.
     * Normally returns "Types", but if the parent type has a property whose PascalCase name
     * is "Types", returns "InnerTypes" to avoid a C# naming collision.
     */
    public getInlineTypesClassName(typeId: TypeId): string {
        const typeDeclaration = this.ir.types[typeId];
        if (typeDeclaration == null) {
            return "Types";
        }
        // Collect properties from both object types and union base properties
        const properties =
            typeDeclaration.shape.type === "object"
                ? [...typeDeclaration.shape.properties, ...(typeDeclaration.shape.extendedProperties ?? [])]
                : typeDeclaration.shape.type === "union"
                  ? typeDeclaration.shape.baseProperties
                  : [];
        const propertyNames = new Set(properties.map((p) => this.case.pascalSafe(p.name)));

        // Also check union variant struct names since discriminated unions generate
        // nested structs for each variant (e.g. `public struct Status { }`).
        if (typeDeclaration.shape.type === "union") {
            for (const variant of typeDeclaration.shape.types) {
                propertyNames.add(this.case.pascalSafe(variant.discriminantValue));
            }
        }

        // Iteratively find a non-colliding name: Types → InnerTypes → InnerTypes2 → ...
        let candidate = "Types";
        if (propertyNames.has(candidate)) {
            candidate = "InnerTypes";
            let suffix = 2;
            while (propertyNames.has(candidate)) {
                candidate = `InnerTypes${suffix}`;
                suffix++;
            }
        }
        return candidate;
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

                        // Register nested serializer class reference
                        this.csharp.classReference({
                            origin: this.model.explicit(typeDeclaration, `${enclosingType.name}Serializer`),
                            enclosingType
                        });
                    } else {
                        // Register companion serializer class reference for regular enums
                        this.csharp.classReference({
                            origin: this.model.explicit(typeDeclaration, `${enclosingType.name}Serializer`),
                            namespace: enclosingType.namespace
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
                            this.csharp.classReference({
                                origin: this.model.explicit(type, "Inner"),
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
                                    wrapper
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
                    name: `${this.case.pascalSafe(endpoint.name)}Test`,

                    namespace: this.namespaces.test
                });
            }
        }

        // after generating the names for everything, freeze the class references
        this.csharp.freezeClassReferences();
    }
}
