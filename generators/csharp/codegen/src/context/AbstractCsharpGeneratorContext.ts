import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import {
    DeclaredErrorName,
    FernFilepath,
    HttpHeader,
    HttpService,
    IntermediateRepresentation,
    Name,
    ObjectPropertyAccess,
    PrimitiveType,
    PrimitiveTypeV1,
    ProtobufService,
    ServiceId,
    Subpackage,
    TypeDeclaration,
    TypeId,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { camelCase, upperFirst } from "lodash-es";
import { convertReadOnlyPrimitiveTypes, System } from "../csharp";
import { BaseCsharpCustomConfigSchema } from "../custom-config/BaseCsharpCustomConfigSchema";
import { GrpcClientInfo } from "../grpc/GrpcClientInfo";
import { nameRegistry } from "../utils/nameRegistry";

export const COLLECTION_ITEM_SERIALIZER_CLASS_NAME = "CollectionItemSerializer";
export const CONSTANTS_CLASS_NAME = "Constants";
export const DATETIME_SERIALIZER_CLASS_NAME = "DateTimeSerializer";
export const ENUM_SERIALIZER_CLASS_NAME = "EnumSerializer";
export const FILE_PARAMETER_CLASS_NAME = "FileParameter";
export const FORM_URL_ENCODER_CLASS_NAME = "FormUrlEncoder";
export const JSON_ACCESS_ATTRIBUTE_NAME = "JsonAccess";
export const JSON_UTILS_CLASS_NAME = "JsonUtils";
export const ONE_OF_SERIALIZER_CLASS_NAME = "OneOfSerializer";
export const QUERY_STRING_CONVERTER_CLASS_NAME = "QueryStringConverter";
export const STRING_ENUM_SERIALIZER_CLASS_NAME = "StringEnumSerializer";
export const VALUE_CONVERT_CLASS_NAME = "ValueConvert";
export const IDEMPOTENT_REQUEST_OPTIONS_CLASS_NAME = "IdempotentRequestOptions";
export const IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME = "IIdempotentRequestOptions";
export const CLIENT_OPTIONS_CLASS_NAME = "ClientOptions";
export const GLOBAL_TEST_SETUP_NAME = "GlobalTestSetup";
export const EXCEPTION_HANDLER_MEMBER_NAME = "ExceptionHandler";
export const REQUEST_OPTIONS_CLASS_NAME = "RequestOptions";
export const REQUEST_OPTIONS_INTERFACE_NAME = "IRequestOptions";

import { fail } from "node:assert";
import { csharp } from "..";
import { CsharpProtobufTypeMapper } from "../proto/CsharpProtobufTypeMapper";
import { ProtobufResolver } from "../proto/ProtobufResolver";
import { OneOf } from "../utils/builtIn";
import { CsharpTypeMapper } from "./CsharpTypeMapper";
export type Namespace = string;

export abstract class AbstractCsharpGeneratorContext<
    CustomConfig extends BaseCsharpCustomConfigSchema
> extends AbstractGeneratorContext {
    protected namespace: string;
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
        return nameRegistry.canonicalizeNamespace(`${this.namespace}.Test`);
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
        return System.Text.Json.JsonElement;
    }

    public getJsonElementType(): csharp.Type {
        return csharp.Type.reference(System.Text.Json.JsonElement);
    }

    public getJsonExtensionDataAttribute(): csharp.Annotation {
        return csharp.annotation({
            reference: System.Text.Json.Serialization.JsonExtensionData
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
            reference: System.Serializable
        });
    }

    public getOauthTokenProviderClassReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: "OAuthTokenProvider"
        });
    }

    public getPagerClassReference({ itemType }: { itemType: csharp.Type }): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: "Pager",
            generics: [itemType]
        });
    }

    public getOffsetPagerClassReference({
        requestType,
        requestOptionsType,
        responseType,
        offsetType,
        stepType,
        itemType
    }: {
        requestType: csharp.Type | csharp.TypeParameter;
        requestOptionsType: csharp.Type | csharp.TypeParameter;
        responseType: csharp.Type | csharp.TypeParameter;
        offsetType: csharp.Type | csharp.TypeParameter;
        stepType: csharp.Type | csharp.TypeParameter;
        itemType: csharp.Type | csharp.TypeParameter;
    }): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: "OffsetPager",
            generics: [requestType, requestOptionsType, responseType, offsetType, stepType, itemType]
        });
    }

    public getCursorPagerClassReference({
        requestType,
        requestOptionsType,
        responseType,
        cursorType,
        itemType
    }: {
        requestType: csharp.Type | csharp.TypeParameter;
        requestOptionsType: csharp.Type | csharp.TypeParameter;
        responseType: csharp.Type | csharp.TypeParameter;
        cursorType: csharp.Type | csharp.TypeParameter;
        itemType: csharp.Type | csharp.TypeParameter;
    }): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: "CursorPager",
            generics: [requestType, requestOptionsType, responseType, cursorType, itemType]
        });
    }

    public getExceptionHandlerClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "ExceptionHandler",
            namespace: this.getCoreNamespace()
        });
    }

    public getExceptionInterceptorClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "IExceptionInterceptor",
            namespace: this.getCoreNamespace()
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

    public getBaseApiExceptionClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: this.customConfig["base-api-exception-class-name"] ?? `${this.getClientPrefix()}ApiException`,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getHeadersClassName(): string {
        return "Headers";
    }

    public getHeadersClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: this.getHeadersClassName(),
            namespace: this.getCoreNamespace()
        });
    }

    public getRootClientClassName(): string {
        return this.customConfig["client-class-name"] ?? `${this.getComputedClientName()}Client`;
    }

    public getRootClientClassNameForSnippets(): string {
        if (this.customConfig["exported-client-class-name"] != null) {
            return this.customConfig["exported-client-class-name"];
        }
        return this.getRootClientClassName();
    }

    public getRootClientClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: this.getRootClientClassName(),
            namespace: this.getNamespace()
        });
    }

    public getRootClientClassReferenceForSnippets(): csharp.ClassReference {
        return csharp.classReference({
            name: this.getRootClientClassNameForSnippets(),
            namespace: this.getNamespace()
        });
    }

    public getBaseExceptionClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: this.customConfig["base-exception-class-name"] ?? `${this.getClientPrefix()}Exception`,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public isForwardCompatibleEnumsEnabled(): boolean {
        return (
            this.customConfig["enable-forward-compatible-enums"] ??
            this.customConfig["experimental-enable-forward-compatible-enums"] ??
            true
        );
    }

    public shouldUseFullyQualifiedNamespaces(): boolean {
        return this.customConfig["experimental-fully-qualified-namespaces"] ?? false;
    }

    public shouldUseDotnetFormat(): boolean {
        return this.customConfig["experimental-dotnet-format"] ?? false;
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
        return System.Text.Json.Nodes.JsonNode;
    }

    public getJsonObjClassReference(): csharp.ClassReference {
        return System.Text.Json.Nodes.JsonObject;
    }

    public getJsonConverterAttributeReference(): csharp.ClassReference {
        return System.Text.Json.Serialization.JsonConverter();
    }

    public getJsonConverterClassReference(typeToConvert: csharp.Type): csharp.ClassReference {
        return System.Text.Json.Serialization.JsonConverter(typeToConvert);
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
            reference: System.Text.Json.Serialization.JsonPropertyName,
            argument: `"${name}"`
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
        return OneOf.OneOf(generics);
    }

    public getProtoConverterClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "ProtoConverter",
            namespace: this.getCoreNamespace()
        });
    }

    public getStringEnumClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "StringEnum",
            namespace: this.getCoreNamespace()
        });
    }

    public getJsonIgnoreAnnotation(): csharp.Annotation {
        return csharp.annotation({ reference: System.Text.Json.Serialization.JsonIgnore });
    }

    public getPascalCaseSafeName(name: Name): string {
        return name.pascalCase.safeName;
    }

    public getTypeDeclarationOrThrow(typeId: TypeId): TypeDeclaration {
        return this.ir.types[typeId] || fail(`Type declaration with id ${typeId} not found`);
    }

    public getEnumerableEmptyKeyValuePairsInitializer(): csharp.MethodInvocation {
        return csharp.invokeMethod({
            on: System.Linq.Enumerable,
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
        return System.Collections.Generic.KeyValuePair(key, value);
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
        return System.Text.Json.Serialization.IJsonOnDeserialized;
    }

    public getIJsonOnSerializingInterfaceReference(): csharp.ClassReference {
        return System.Text.Json.Serialization.IJsonOnSerializing;
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

    public getSubpackageClassReference(subpackage: Subpackage): csharp.ClassReference {
        return csharp.classReference({
            name: `${subpackage.name.pascalCase.unsafeName}Client`,
            namespace: this.getNamespaceFromFernFilepath(subpackage.fernFilepath)
        });
    }

    public getRawClientClassName(): string {
        return "RawClient";
    }

    public getRawClientClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: this.getRawClientClassName(),
            namespace: this.getCoreNamespace()
        });
    }

    /**
     * Returns the service with the given id
     * @param serviceId
     * @returns
     */
    public getHttpServiceOrThrow(serviceId: ServiceId): HttpService {
        return this.ir.services[serviceId] || fail(`Service with id ${serviceId} not found`);
    }

    protected getComputedClientName(): string {
        return `${upperFirst(camelCase(this.config.organization))}${this.ir.apiName.pascalCase.unsafeName}`;
    }

    protected getClientPrefix(): string {
        return (
            this.customConfig["exported-client-class-name"] ??
            this.customConfig["client-class-name"] ??
            this.getComputedClientName()
        );
    }

    protected getEnvironmentClassName(): string {
        return this.customConfig["environment-class-name"] ?? `${this.getClientPrefix()}Environment`;
    }

    public getEnvironmentsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: this.getEnvironmentClassName(),
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getNamespaceForPublicCoreClasses(): string {
        return (this.customConfig["root-namespace-for-core-classes"] ?? true)
            ? this.getNamespace()
            : this.getCoreNamespace();
    }

    public getBaseMockServerTestClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "BaseMockServerTest",
            namespace: this.getMockServerTestNamespace()
        });
    }

    public getClientOptionsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: CLIENT_OPTIONS_CLASS_NAME,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getRequestOptionsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: REQUEST_OPTIONS_CLASS_NAME,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getRequestOptionsInterfaceReference(): csharp.ClassReference {
        return csharp.classReference({
            name: REQUEST_OPTIONS_INTERFACE_NAME,
            namespace: this.getCoreNamespace()
        });
    }

    public getIdempotentRequestOptionsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: IDEMPOTENT_REQUEST_OPTIONS_CLASS_NAME,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getIdempotentRequestOptionsInterfaceClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME,
            namespace: this.getCoreNamespace()
        });
    }

    public getJsonRequestClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "JsonRequest",
            namespace: this.getCoreNamespace()
        });
    }

    public getHttpResponseHeadersReference(): csharp.ClassReference {
        return System.Net.Http.HttpResponseHeaders;
    }

    public getSubpackageForServiceId(serviceId: ServiceId): Subpackage | undefined {
        return Object.values(this.ir.subpackages).find((subpackage) => subpackage.service === serviceId);
    }

    public getSubpackageForServiceIdOrThrow(serviceId: ServiceId): Subpackage {
        return (
            this.getSubpackageForServiceId(serviceId) ||
            fail(`No example found for subpackage with serviceId ${serviceId}`)
        );
    }

    public getSubpackageClassReferenceForServiceIdOrThrow(serviceId: ServiceId): csharp.ClassReference {
        return this.getSubpackageClassReference(this.getSubpackageForServiceIdOrThrow(serviceId));
    }

    public getNamespaceForServiceId(serviceId: ServiceId): string {
        return this.getNamespaceFromFernFilepath(this.getHttpServiceOrThrow(serviceId).name.fernFilepath);
    }

    public getExceptionClassReference(declaredErrorName: DeclaredErrorName): csharp.ClassReference {
        return csharp.classReference({
            name: this.getPascalCaseSafeName(declaredErrorName.name),
            namespace: this.getNamespaceFromFernFilepath(declaredErrorName.fernFilepath)
        });
    }

    public getRawGrpcClientClassName(): string {
        return "RawGrpcClient";
    }

    public getRawGrpcClientClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: this.getRawGrpcClientClassName(),
            namespace: this.getCoreNamespace()
        });
    }

    public getExtensionsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "Extensions",
            namespace: this.getCoreNamespace()
        });
    }

    public getGrpcRequestOptionsName(): string {
        return "GrpcRequestOptions";
    }

    public getGrpcCreateCallOptionsMethodName(): string {
        return "CreateCallOptions";
    }

    public getGrpcRequestOptionsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: this.getGrpcRequestOptionsName(),
            namespace: this.getNamespace()
        });
    }

    public getGrpcChannelOptionsFieldName(): string {
        return "GrpcOptions";
    }

    public getGrpcChannelOptionsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "GrpcChannelOptions",
            namespace: "Grpc.Net.Client"
        });
    }

    public getCancellationTokenClassReference(): csharp.ClassReference {
        return csharp.classReference(System.Threading.CancellationToken);
    }

    public getRequestWrapperReference(serviceId: ServiceId, requestName: Name): csharp.ClassReference {
        return csharp.classReference({
            name: requestName.pascalCase.safeName,
            namespace: this.getNamespaceForServiceId(serviceId)
        });
    }

    private getGrpcClientPrivatePropertyName(protobufService: ProtobufService): string {
        return `_${protobufService.name.camelCase.safeName}`;
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
            privatePropertyName: this.getGrpcClientPrivatePropertyName(protobufService),
            classReference: csharp.classReference({
                name: `${serviceName}.${serviceName}Client`,
                namespace: this.protobufResolver.getNamespaceFromProtobufFileOrThrow(protobufService.file)
            }),
            protobufService
        };
    }
}

function stripNonAlphanumeric(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, "");
}
