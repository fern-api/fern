import { camelCase, upperFirst } from "lodash-es";

import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { BaseCsharpCustomConfigSchema, convertReadOnlyPrimitiveTypes, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import {
    FernFilepath,
    HttpHeader,
    IntermediateRepresentation,
    Name,
    ObjectPropertyAccess,
    PrimitiveType,
    PrimitiveTypeV1,
    TypeDeclaration,
    TypeId,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";

import {
    COLLECTION_ITEM_SERIALIZER_CLASS_NAME,
    CONSTANTS_CLASS_NAME,
    DATETIME_SERIALIZER_CLASS_NAME,
    ENUM_SERIALIZER_CLASS_NAME,
    JSON_ACCESS_ATTRIBUTE_NAME,
    JSON_UTILS_CLASS_NAME,
    ONE_OF_SERIALIZER_CLASS_NAME,
    STRING_ENUM_SERIALIZER_CLASS_NAME,
    VALUE_CONVERT_CLASS_NAME
} from "../AsIs";
import { CsharpProject } from "../project";
import { Namespace } from "../project/CSharpFile";
import { CORE_DIRECTORY_NAME, PUBLIC_CORE_DIRECTORY_NAME } from "../project/CsharpProject";
import { CsharpProtobufTypeMapper } from "../proto/CsharpProtobufTypeMapper";
import { ProtobufResolver } from "../proto/ProtobufResolver";
import { CsharpTypeMapper } from "./CsharpTypeMapper";

export abstract class AbstractCsharpGeneratorContext<
    CustomConfig extends BaseCsharpCustomConfigSchema
> extends AbstractGeneratorContext {
    private namespace: string;
    public readonly project: CsharpProject;
    public readonly csharpTypeMapper: CsharpTypeMapper;
    public readonly csharpProtobufTypeMapper: CsharpProtobufTypeMapper;
    public readonly protobufResolver: ProtobufResolver;
    public publishConfig: FernGeneratorExec.NugetGithubPublishInfo | undefined;
    private allNamespaceSegments?: Set<string>;
    private allTypeClassReferences?: Map<string, Set<Namespace>>;
    private readOnlyMemoryTypes: Set<PrimitiveTypeV1>;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.namespace =
            this.customConfig.namespace ??
            upperFirst(camelCase(`${this.config.organization}_${this.ir.apiName.pascalCase.unsafeName}`));
        this.project = new CsharpProject({
            context: this,
            name: this.namespace
        });
        this.csharpTypeMapper = new CsharpTypeMapper(this);
        this.csharpProtobufTypeMapper = new CsharpProtobufTypeMapper(this);
        this.protobufResolver = new ProtobufResolver(this, this.csharpTypeMapper);
        this.readOnlyMemoryTypes = new Set<PrimitiveTypeV1>(
            convertReadOnlyPrimitiveTypes(this.customConfig["read-only-memory-types"] ?? [])
        );
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
    }

    public getNamespace(): string {
        return this.namespace;
    }

    public getPackageId(): string {
        return this.customConfig["package-id"] ?? this.getNamespace();
    }

    public getCoreNamespace(): string {
        return `${this.namespace}.Core`;
    }

    public getPublicCoreNamespace(): string {
        return this.getNamespace();
    }

    public getTestNamespace(): string {
        return `${this.namespace}.Test`;
    }

    public getTestUtilsNamespace(): string {
        return `${this.getTestNamespace()}.Utils`;
    }

    public getMockServerTestNamespace(): string {
        return `${this.getTestNamespace()}.Unit.MockServer`;
    }

    public hasGrpcEndpoints(): boolean {
        // TODO: Replace this with the this.ir.sdkConfig.hasGrpcEndpoints property (when available).
        return Object.values(this.ir.services).some((service) => service.transport?.type === "grpc");
    }

    public hasIdempotencyHeaders(): boolean {
        return this.getIdempotencyHeaders().length > 0;
    }

    public getIdempotencyHeaders(): HttpHeader[] {
        return this.ir.idempotencyHeaders;
    }

    public shouldGenerateDiscriminatedUnions(): boolean {
        return this.customConfig["use-discriminated-unions"] ?? true;
    }

    public getJsonElementClassReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: "System.Text.Json",
            name: "JsonElement"
        });
    }

    public getJsonElementType(): csharp.Type {
        return csharp.Type.reference(
            csharp.classReference({
                namespace: "System.Text.Json",
                name: "JsonElement"
            })
        );
    }

    public getJsonExtensionDataAttribute(): csharp.Annotation {
        return csharp.annotation({
            reference: csharp.classReference({
                name: "JsonExtensionData",
                namespace: "System.Text.Json.Serialization"
            })
        });
    }

    public getAdditionalPropertiesType(genericType?: csharp.Type): csharp.Type {
        return csharp.Type.reference(this.getAdditionalPropertiesClassReference(genericType));
    }

    public getReadOnlyAdditionalPropertiesType(genericType?: csharp.Type): csharp.Type {
        return csharp.Type.reference(this.getReadOnlyAdditionalPropertiesClassReference(genericType));
    }

    public getSerializableAttribute(): csharp.Annotation {
        return csharp.annotation({
            reference: csharp.classReference({
                name: "Serializable",
                namespace: "System"
            })
        });
    }

    public getValueConvertReference(): csharp.ClassReference {
        return csharp.classReference({
            name: VALUE_CONVERT_CLASS_NAME,
            namespace: this.getCoreNamespace()
        });
    }

    public getFileParamClassReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getPublicCoreNamespace(),
            name: "FileParameter"
        });
    }

    public isForwardCompatibleEnumsEnabled(): boolean {
        return (
            this.customConfig["enable-forward-compatible-enums"] ??
            this.customConfig["experimental-enable-forward-compatible-enums"] ??
            true
        );
    }

    public generateNewAdditionalProperties(): boolean {
        return (
            this.customConfig["additional-properties"] ??
            this.customConfig["experimental-additional-properties"] ??
            true
        );
    }

    public getProtoAnyMapperClassReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: "ProtoAnyMapper"
        });
    }

    public getConstantsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: CONSTANTS_CLASS_NAME
        });
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
                const classReference = this.csharpTypeMapper.convertToClassReference(typeDeclaration.name);
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

    abstract getChildNamespaceSegments(fernFilepath: FernFilepath): string[];

    public getFullNamespaceSegments(fernFilepath: FernFilepath): string[] {
        return [this.getNamespace(), ...this.getChildNamespaceSegments(fernFilepath)];
    }

    public getStringEnumSerializerClassReference(enumClassReference: csharp.ClassReference): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: STRING_ENUM_SERIALIZER_CLASS_NAME,
            generics: [csharp.Type.reference(enumClassReference)]
        });
    }

    public getEnumSerializerClassReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: ENUM_SERIALIZER_CLASS_NAME
        });
    }

    public getDateTimeSerializerClassReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: DATETIME_SERIALIZER_CLASS_NAME
        });
    }

    public getJsonUtilsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: JSON_UTILS_CLASS_NAME
        });
    }

    public getJsonNodeClassReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: "System.Text.Json.Nodes",
            name: "JsonNode"
        });
    }

    public getJsonObjClassReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: "System.Text.Json.Nodes",
            name: "JsonObject"
        });
    }

    public getJsonConverterAttributeReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: "System.Text.Json.Serialization",
            name: "JsonConverter"
        });
    }

    public getJsonConverterClassReference(typeToConvert: csharp.Type): csharp.ClassReference {
        return csharp.classReference({
            namespace: "System.Text.Json.Serialization",
            name: "JsonConverter",
            generics: [typeToConvert]
        });
    }

    public createJsonAccessAttribute(propertyAccess: ObjectPropertyAccess): csharp.Annotation {
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
        return csharp.annotation({
            reference: csharp.classReference({
                namespace: this.getCoreNamespace(),
                name: JSON_ACCESS_ATTRIBUTE_NAME
            }),
            argument
        });
    }

    public createJsonPropertyNameAttribute(name: string): csharp.Annotation {
        return csharp.annotation({
            reference: csharp.classReference({
                namespace: "System.Text.Json.Serialization",
                name: "JsonPropertyName"
            }),
            argument: `"${name}"`
        });
    }

    public getJsonExceptionClassReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: "System.Text.Json",
            name: "JsonException"
        });
    }

    public getSystemEnumClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "Enum",
            namespace: "System"
        });
    }

    public getVersionClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "Version",
            namespace: this.getPublicCoreNamespace()
        });
    }

    public getCurrentVersionValueAccess(): csharp.CodeBlock {
        return csharp.codeblock((writer) => {
            writer.writeNode(this.getVersionClassReference());
            writer.write(".");
            writer.write(this.getCurrentVersionPropertyName());
        });
    }

    public getCurrentVersionPropertyName(): string {
        return "Current";
    }

    public getCollectionItemSerializerReference(
        itemType: csharp.ClassReference,
        serializer: csharp.ClassReference
    ): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: COLLECTION_ITEM_SERIALIZER_CLASS_NAME,
            generics: [csharp.Type.reference(itemType), csharp.Type.reference(serializer)]
        });
    }

    public getOneOfSerializerClassReference(oneof: csharp.ClassReference): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: ONE_OF_SERIALIZER_CLASS_NAME,
            generics: [csharp.Type.reference(oneof)]
        });
    }

    public getOneOfClassReference(generics: csharp.Type[]): csharp.ClassReference {
        return csharp.classReference({
            namespace: "OneOf",
            name: "OneOf",
            generics
        });
    }

    public getProtoConverterClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "ProtoConverter",
            namespace: this.getCoreNamespace()
        });
    }

    public getJsonIgnoreAnnotation(): csharp.Annotation {
        return csharp.annotation({
            reference: csharp.classReference({
                name: "JsonIgnore",
                namespace: "System.Text.Json.Serialization"
            })
        });
    }

    public getPascalCaseSafeName(name: Name): string {
        return name.pascalCase.safeName;
    }

    public getTypeDeclarationOrThrow(typeId: TypeId): TypeDeclaration {
        const typeDeclaration = this.getTypeDeclaration(typeId);
        if (typeDeclaration == null) {
            throw new Error(`Type declaration with id ${typeId} not found`);
        }
        return typeDeclaration;
    }

    public getTypeDeclaration(typeId: TypeId): TypeDeclaration | undefined {
        return this.ir.types[typeId];
    }

    public getCoreDirectory(): RelativeFilePath {
        return RelativeFilePath.of(CORE_DIRECTORY_NAME);
    }

    public getPublicCoreDirectory(): RelativeFilePath {
        return join(this.getCoreDirectory(), RelativeFilePath.of(PUBLIC_CORE_DIRECTORY_NAME));
    }

    public getEnumerableClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "Enumerable",
            namespace: "System.Linq"
        });
    }

    public getEnumerableEmptyKeyValuePairsInitializer(): csharp.MethodInvocation {
        return csharp.invokeMethod({
            on: this.getEnumerableClassReference(),
            method: "Empty",
            generics: [
                csharp.Type.reference(
                    this.getKeyValuePairsClassReference({
                        key: csharp.Type.string(),
                        value: csharp.Type.string()
                    })
                )
            ],
            arguments_: []
        });
    }

    public getKeyValuePairsClassReference({
        key,
        value
    }: {
        key: csharp.Type;
        value: csharp.Type;
    }): csharp.ClassReference {
        return csharp.classReference({
            name: "KeyValuePair",
            namespace: "System.Collections.Generic",
            generics: [key, value]
        });
    }

    public getAdditionalPropertiesClassReference(genericType?: csharp.Type): csharp.ClassReference {
        return csharp.classReference({
            name: "AdditionalProperties",
            namespace: this.getPublicCoreNamespace(),
            generics: genericType ? [genericType] : undefined
        });
    }

    public getReadOnlyAdditionalPropertiesClassReference(genericType?: csharp.Type): csharp.ClassReference {
        return csharp.classReference({
            name: "ReadOnlyAdditionalProperties",
            namespace: this.getPublicCoreNamespace(),
            generics: genericType ? [genericType] : undefined
        });
    }

    public getIJsonOnDeserializedInterfaceReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "IJsonOnDeserialized",
            namespace: "System.Text.Json.Serialization"
        });
    }

    public getIJsonOnSerializingInterfaceReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "IJsonOnSerializing",
            namespace: "System.Text.Json.Serialization"
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

        const declaration = this.getTypeDeclarationOrThrow(reference.typeId);
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
                const resolvedTypeDeclaration = this.getTypeDeclarationOrThrow(reference.typeId);
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

    public getToStringMethod(): csharp.Method {
        return csharp.method({
            name: "ToString",
            access: csharp.Access.Public,
            isAsync: false,
            override: true,
            parameters: [],
            return_: csharp.Type.string(),
            doc: {
                inheritdoc: true
            },
            body: csharp.codeblock((writer) => {
                writer.write("return ");
                writer.writeNodeStatement(
                    csharp.invokeMethod({
                        on: this.getJsonUtilsClassReference(),
                        method: "Serialize",
                        arguments_: [csharp.codeblock("this")]
                    })
                );
            })
        });
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
                const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
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
                const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
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
                const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
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

    public getDefaultValueForPrimitive({ primitive }: { primitive: PrimitiveType }): csharp.CodeBlock {
        return PrimitiveTypeV1._visit<csharp.CodeBlock>(primitive.v1, {
            integer: () => csharp.codeblock("0"),
            long: () => csharp.codeblock("0"),
            uint: () => csharp.codeblock("0"),
            uint64: () => csharp.codeblock("0"),
            float: () => csharp.codeblock("0.0f"),
            double: () => csharp.codeblock("0.0"),
            boolean: () => csharp.codeblock("false"),
            string: () => csharp.codeblock('""'),
            date: () => csharp.codeblock("DateOnly.MinValue"),
            dateTime: () => csharp.codeblock("DateTime.MinValue"),
            uuid: () => csharp.codeblock('""'),
            base64: () => csharp.codeblock('""'),
            bigInteger: () => csharp.codeblock('""'),
            _other: () => csharp.codeblock("null")
        });
    }

    /**
     * Prints the Type in a simple string format.
     */
    public printType(type: csharp.Type | csharp.TypeParameter): string {
        return type.toString({
            namespace: this.getNamespace(),
            allNamespaceSegments: this.getAllNamespaceSegments(),
            allTypeClassReferences: this.getAllTypeClassReferences(),
            rootNamespace: this.getNamespace(),
            customConfig: this.customConfig,
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
    }): csharp.CodeBlock | undefined {
        const literalValue = this.getLiteralValue(typeReference);
        if (literalValue != null) {
            return csharp.codeblock(
                typeof literalValue === "boolean"
                    ? `${literalValue.toString().toLowerCase()}`
                    : csharp.string_({ string: literalValue })
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
            const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
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

    public getCustomPagerClassReference({ itemType }: { itemType: csharp.Type }): csharp.ClassReference {
        return csharp.classReference({
            name: this.getCustomPagerName(),
            namespace: this.getCoreNamespace(),
            generics: [itemType]
        });
    }

    public getCustomPagerFactoryClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: `${this.getCustomPagerName()}Factory`,
            namespace: this.getCoreNamespace()
        });
    }

    public getCustomPagerContextClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: `${this.getCustomPagerName()}Context`,
            namespace: this.getCoreNamespace()
        });
    }

    public invokeCustomPagerFactoryMethod({
        itemType,
        sendRequestMethod,
        initialRequest,
        clientOptions,
        requestOptions,
        cancellationToken
    }: {
        itemType: csharp.Type;
        sendRequestMethod: csharp.CodeBlock;
        initialRequest: csharp.CodeBlock;
        clientOptions: csharp.CodeBlock;
        requestOptions: csharp.CodeBlock;
        cancellationToken: csharp.CodeBlock;
    }): csharp.MethodInvocation {
        return csharp.invokeMethod({
            on: this.getCustomPagerFactoryClassReference(),
            method: "CreateAsync",
            async: true,
            arguments_: [
                csharp.instantiateClass({
                    classReference: this.getCustomPagerContextClassReference(),
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

    public abstract shouldCreateCustomPagination(): boolean;

    public getCustomPagerName(): string {
        return this.customConfig["custom-pager-name"] ?? `${stripNonAlphanumeric(this.getPackageId())}Pager`;
    }

    public abstract getRawAsIsFiles(): string[];

    public abstract getCoreAsIsFiles(): string[];

    public abstract getCoreTestAsIsFiles(): string[];

    public abstract getPublicCoreAsIsFiles(): string[];

    public abstract getPublicCoreTestAsIsFiles(): string[];

    public abstract getAsIsTestUtils(): string[];

    public abstract getDirectoryForTypeId(typeId: TypeId): string;

    public abstract getNamespaceForTypeId(typeId: TypeId): string;

    public abstract getExtraDependencies(): Record<string, string>;
}

function stripNonAlphanumeric(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, "");
}
