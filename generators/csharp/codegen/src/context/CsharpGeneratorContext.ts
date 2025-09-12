import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import {
    DeclaredErrorName,
    EnumTypeDeclaration,
    ExampleEndpointCall,
    FernFilepath,
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
import { camelCase, upperFirst } from "lodash-es";
import { convertReadOnlyPrimitiveTypes } from "../ast";
import { BaseCsharpCustomConfigSchema } from "../custom-config/BaseCsharpCustomConfigSchema";
import { GrpcClientInfo } from "../grpc/GrpcClientInfo";

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
import { ast, CSharp } from "..";
import { CsharpProtobufTypeMapper } from "../proto/CsharpProtobufTypeMapper";
import { ProtobufResolver } from "../proto/ProtobufResolver";

import { CsharpTypeMapper } from "./CsharpTypeMapper";
export type Namespace = string;

export class CsharpGeneratorContext<
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
    public readonly csharp;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.csharp = new CSharp();

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
        return this.csharp.nameRegistry.canonicalizeNamespace(`${this.namespace}.Test`);
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

    public getJsonElementClassReference(): ast.ClassReference {
        return this.csharp.System.Text.Json.JsonElement;
    }

    public getJsonElementType(): ast.Type {
        return this.csharp.Type.reference(this.csharp.System.Text.Json.JsonElement);
    }

    public getJsonExtensionDataAttribute(): ast.Annotation {
        return this.csharp.annotation({
            reference: this.csharp.System.Text.Json.Serialization.JsonExtensionData
        });
    }

    public getAdditionalPropertiesType(genericType?: ast.Type): ast.Type {
        return this.csharp.Type.reference(this.getAdditionalPropertiesClassReference(genericType));
    }

    public getReadOnlyAdditionalPropertiesType(genericType?: ast.Type): ast.Type {
        return this.csharp.Type.reference(this.getReadOnlyAdditionalPropertiesClassReference(genericType));
    }

    public getSerializableAttribute(): ast.Annotation {
        return this.csharp.annotation({
            reference: this.csharp.System.Serializable
        });
    }

    public getOauthTokenProviderClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: "OAuthTokenProvider"
        });
    }

    public getPagerClassReference({ itemType }: { itemType: ast.Type }): ast.ClassReference {
        return this.csharp.classReference({
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
        requestType: ast.Type | ast.TypeParameter;
        requestOptionsType: ast.Type | ast.TypeParameter;
        responseType: ast.Type | ast.TypeParameter;
        offsetType: ast.Type | ast.TypeParameter;
        stepType: ast.Type | ast.TypeParameter;
        itemType: ast.Type | ast.TypeParameter;
    }): ast.ClassReference {
        return this.csharp.classReference({
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
        requestType: ast.Type | ast.TypeParameter;
        requestOptionsType: ast.Type | ast.TypeParameter;
        responseType: ast.Type | ast.TypeParameter;
        cursorType: ast.Type | ast.TypeParameter;
        itemType: ast.Type | ast.TypeParameter;
    }): ast.ClassReference {
        return this.csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: "CursorPager",
            generics: [requestType, requestOptionsType, responseType, cursorType, itemType]
        });
    }

    public getExceptionHandlerClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: "ExceptionHandler",
            namespace: this.getCoreNamespace()
        });
    }

    public getExceptionInterceptorClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: "IExceptionInterceptor",
            namespace: this.getCoreNamespace()
        });
    }

    public getValueConvertReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: VALUE_CONVERT_CLASS_NAME,
            namespace: this.getCoreNamespace()
        });
    }

    public getFileParamClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            namespace: this.getPublicCoreNamespace(),
            name: "FileParameter"
        });
    }

    public getBaseApiExceptionClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: this.customConfig["base-api-exception-class-name"] ?? `${this.getClientPrefix()}ApiException`,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getHeadersClassName(): string {
        return "Headers";
    }

    public getHeadersClassReference(): ast.ClassReference {
        return this.csharp.classReference({
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

    public getRootClientClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: this.getRootClientClassName(),
            namespace: this.getNamespace()
        });
    }

    public getRootClientClassReferenceForSnippets(): ast.ClassReference {
        return this.csharp.classReference({
            name: this.getRootClientClassNameForSnippets(),
            namespace: this.getNamespace()
        });
    }

    public getBaseExceptionClassReference(): ast.ClassReference {
        return this.csharp.classReference({
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

    public getProtoAnyMapperClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: "ProtoAnyMapper"
        });
    }

    public getConstantsClassReference(): ast.ClassReference {
        return this.csharp.classReference({
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

    getChildNamespaceSegments(fernFilepath: FernFilepath): string[] {
        return [];
    }

    public getFullNamespaceSegments(fernFilepath: FernFilepath): string[] {
        return [this.getNamespace(), ...this.getChildNamespaceSegments(fernFilepath)];
    }

    public getStringEnumSerializerClassReference(enumClassReference: ast.ClassReference): ast.ClassReference {
        return this.csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: STRING_ENUM_SERIALIZER_CLASS_NAME,
            generics: [this.csharp.Type.reference(enumClassReference)]
        });
    }

    public getEnumSerializerClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: ENUM_SERIALIZER_CLASS_NAME
        });
    }

    public getDateTimeSerializerClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: DATETIME_SERIALIZER_CLASS_NAME
        });
    }

    public getJsonUtilsClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: JSON_UTILS_CLASS_NAME
        });
    }

    public getJsonNodeClassReference(): ast.ClassReference {
        return this.csharp.System.Text.Json.Nodes.JsonNode;
    }

    public getJsonObjClassReference(): ast.ClassReference {
        return this.csharp.System.Text.Json.Nodes.JsonObject;
    }

    public getJsonConverterAttributeReference(): ast.ClassReference {
        return this.csharp.System.Text.Json.Serialization.JsonConverter();
    }

    public getJsonConverterClassReference(typeToConvert: ast.Type): ast.ClassReference {
        return this.csharp.System.Text.Json.Serialization.JsonConverter(typeToConvert);
    }

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
                namespace: this.getCoreNamespace(),
                name: JSON_ACCESS_ATTRIBUTE_NAME
            }),
            argument
        });
    }

    public createJsonPropertyNameAttribute(name: string): ast.Annotation {
        return this.csharp.annotation({
            reference: this.csharp.System.Text.Json.Serialization.JsonPropertyName,
            argument: `"${name}"`
        });
    }

    public getVersionClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: "Version",
            namespace: this.getPublicCoreNamespace()
        });
    }

    public getCurrentVersionValueAccess(): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.writeNode(this.getVersionClassReference());
            writer.write(".");
            writer.write(this.getCurrentVersionPropertyName());
        });
    }

    public getCurrentVersionPropertyName(): string {
        return "Current";
    }

    public getCollectionItemSerializerReference(
        itemType: ast.ClassReference,
        serializer: ast.ClassReference
    ): ast.ClassReference {
        return this.csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: COLLECTION_ITEM_SERIALIZER_CLASS_NAME,
            generics: [this.csharp.Type.reference(itemType), this.csharp.Type.reference(serializer)]
        });
    }

    public getOneOfSerializerClassReference(oneof: ast.ClassReference): ast.ClassReference {
        return this.csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: ONE_OF_SERIALIZER_CLASS_NAME,
            generics: [this.csharp.Type.reference(oneof)]
        });
    }

    public getOneOfClassReference(generics: ast.Type[]): ast.ClassReference {
        return this.csharp.OneOf.OneOf(generics);
    }

    public getProtoConverterClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: "ProtoConverter",
            namespace: this.getCoreNamespace()
        });
    }

    public getStringEnumClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: "StringEnum",
            namespace: this.getCoreNamespace()
        });
    }

    public getJsonIgnoreAnnotation(): ast.Annotation {
        return this.csharp.annotation({ reference: this.csharp.System.Text.Json.Serialization.JsonIgnore });
    }

    public getPascalCaseSafeName(name: Name): string {
        return name.pascalCase.safeName;
    }

    public getTypeDeclarationOrThrow(typeId: TypeId): TypeDeclaration {
        return this.ir.types[typeId] || fail(`Type declaration with id ${typeId} not found`);
    }

    public getEnumerableEmptyKeyValuePairsInitializer(): ast.MethodInvocation {
        return this.csharp.invokeMethod({
            on: this.csharp.System.Linq.Enumerable,
            method: "Empty",
            generics: [
                this.csharp.Type.reference(
                    this.getKeyValuePairsClassReference({
                        key: this.csharp.Type.string(),
                        value: this.csharp.Type.string()
                    })
                )
            ],
            arguments_: []
        });
    }

    public getKeyValuePairsClassReference({ key, value }: { key: ast.Type; value: ast.Type }): ast.ClassReference {
        return this.csharp.System.Collections.Generic.KeyValuePair(key, value);
    }

    public getAdditionalPropertiesClassReference(genericType?: ast.Type): ast.ClassReference {
        return this.csharp.classReference({
            name: "AdditionalProperties",
            namespace: this.getPublicCoreNamespace(),
            generics: genericType ? [genericType] : undefined
        });
    }

    public getReadOnlyAdditionalPropertiesClassReference(genericType?: ast.Type): ast.ClassReference {
        return this.csharp.classReference({
            name: "ReadOnlyAdditionalProperties",
            namespace: this.getPublicCoreNamespace(),
            generics: genericType ? [genericType] : undefined
        });
    }

    public getIJsonOnDeserializedInterfaceReference(): ast.ClassReference {
        return this.csharp.System.Text.Json.Serialization.IJsonOnDeserialized;
    }

    public getIJsonOnSerializingInterfaceReference(): ast.ClassReference {
        return this.csharp.System.Text.Json.Serialization.IJsonOnSerializing;
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

    public getToStringMethod(): ast.Method {
        return this.csharp.method({
            name: "ToString",
            access: ast.Access.Public,
            isAsync: false,
            override: true,
            parameters: [],
            return_: this.csharp.Type.string(),
            doc: {
                inheritdoc: true
            },
            body: this.csharp.codeblock((writer) => {
                writer.write("return ");
                writer.writeNodeStatement(
                    this.csharp.invokeMethod({
                        on: this.getJsonUtilsClassReference(),
                        method: "Serialize",
                        arguments_: [this.csharp.codeblock("this")]
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
    public printType(type: ast.Type | ast.TypeParameter): string {
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

    public getCustomPagerClassReference({ itemType }: { itemType: ast.Type }): ast.ClassReference {
        return this.csharp.classReference({
            name: this.getCustomPagerName(),
            namespace: this.getCoreNamespace(),
            generics: [itemType]
        });
    }

    public getCustomPagerFactoryClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: `${this.getCustomPagerName()}Factory`,
            namespace: this.getCoreNamespace()
        });
    }

    public getCustomPagerContextClassReference(): ast.ClassReference {
        return this.csharp.classReference({
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
        itemType: ast.Type;
        sendRequestMethod: ast.CodeBlock;
        initialRequest: ast.CodeBlock;
        clientOptions: ast.CodeBlock;
        requestOptions: ast.CodeBlock;
        cancellationToken: ast.CodeBlock;
    }): ast.MethodInvocation {
        return this.csharp.invokeMethod({
            on: this.getCustomPagerFactoryClassReference(),
            method: "CreateAsync",
            async: true,
            arguments_: [
                this.csharp.instantiateClass({
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

    public shouldCreateCustomPagination(): boolean {
        return false;
    }

    public getCustomPagerName(): string {
        return this.customConfig["custom-pager-name"] ?? `${stripNonAlphanumeric(this.getPackageId())}Pager`;
    }

    public getRawAsIsFiles(): string[] {
        return [];
    }

    public getCoreAsIsFiles(): string[] {
        return [];
    }

    public getCoreTestAsIsFiles(): string[] {
        return [];
    }

    public getPublicCoreAsIsFiles(): string[] {
        return [];
    }

    public getPublicCoreTestAsIsFiles(): string[] {
        return [];
    }

    public getAsIsTestUtils(): string[] {
        return [];
    }

    public getDirectoryForTypeId(typeId: TypeId): string {
        return "";
    }

    public getNamespaceForTypeId(typeId: TypeId): string {
        return "";
    }

    public getExtraDependencies(): Record<string, string> {
        return {};
    }

    public getSubpackageClassReference(subpackage: Subpackage): ast.ClassReference {
        return this.csharp.classReference({
            name: `${subpackage.name.pascalCase.unsafeName}Client`,
            namespace: this.getNamespaceFromFernFilepath(subpackage.fernFilepath)
        });
    }

    public getRawClientClassName(): string {
        return "RawClient";
    }

    public getRawClientClassReference(): ast.ClassReference {
        return this.csharp.classReference({
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

    public getEnvironmentsClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: this.getEnvironmentClassName(),
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getNamespaceForPublicCoreClasses(): string {
        return (this.customConfig["root-namespace-for-core-classes"] ?? true)
            ? this.getNamespace()
            : this.getCoreNamespace();
    }

    public getBaseMockServerTestClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: "BaseMockServerTest",
            namespace: this.getMockServerTestNamespace()
        });
    }

    public getClientOptionsClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: CLIENT_OPTIONS_CLASS_NAME,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getRequestOptionsClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: REQUEST_OPTIONS_CLASS_NAME,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getRequestOptionsInterfaceReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: REQUEST_OPTIONS_INTERFACE_NAME,
            namespace: this.getCoreNamespace()
        });
    }

    public getIdempotentRequestOptionsClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: IDEMPOTENT_REQUEST_OPTIONS_CLASS_NAME,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getIdempotentRequestOptionsInterfaceClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME,
            namespace: this.getCoreNamespace()
        });
    }

    public getJsonRequestClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: "JsonRequest",
            namespace: this.getCoreNamespace()
        });
    }

    public getHttpResponseHeadersReference(): ast.ClassReference {
        return this.csharp.System.Net.Http.HttpResponseHeaders;
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

    public getSubpackageClassReferenceForServiceIdOrThrow(serviceId: ServiceId): ast.ClassReference {
        return this.getSubpackageClassReference(this.getSubpackageForServiceIdOrThrow(serviceId));
    }

    public getNamespaceForServiceId(serviceId: ServiceId): string {
        return this.getNamespaceFromFernFilepath(this.getHttpServiceOrThrow(serviceId).name.fernFilepath);
    }

    public getExceptionClassReference(declaredErrorName: DeclaredErrorName): ast.ClassReference {
        return this.csharp.classReference({
            name: this.getPascalCaseSafeName(declaredErrorName.name),
            namespace: this.getNamespaceFromFernFilepath(declaredErrorName.fernFilepath)
        });
    }

    public getRawGrpcClientClassName(): string {
        return "RawGrpcClient";
    }

    public getRawGrpcClientClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: this.getRawGrpcClientClassName(),
            namespace: this.getCoreNamespace()
        });
    }

    public getExtensionsClassReference(): ast.ClassReference {
        return this.csharp.classReference({
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

    public getGrpcRequestOptionsClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: this.getGrpcRequestOptionsName(),
            namespace: this.getNamespace()
        });
    }

    public getGrpcChannelOptionsFieldName(): string {
        return "GrpcOptions";
    }

    public getGrpcChannelOptionsClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: "GrpcChannelOptions",
            namespace: "Grpc.Net.Client"
        });
    }

    public getCancellationTokenClassReference(): ast.ClassReference {
        return this.csharp.classReference(this.csharp.System.Threading.CancellationToken);
    }

    public getRequestWrapperReference(serviceId: ServiceId, requestName: Name): ast.ClassReference {
        return this.csharp.classReference({
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
            classReference: this.csharp.classReference({
                name: `${serviceName}.${serviceName}Client`,
                namespace: this.protobufResolver.getNamespaceFromProtobufFileOrThrow(protobufService.file)
            }),
            protobufService
        };
    }

    precalculate() {
        console.log(`=== STARTING PRECALCULATE ${process.pid} ===`);

        // types that can get used
        this.csharp.nameRegistry.trackType(this.getReadOnlyAdditionalPropertiesClassReference());
        this.csharp.nameRegistry.trackType(this.getJsonUtilsClassReference());

        this.csharp.nameRegistry.trackType(
            this.csharp.classReference({
                name: "IStringEnum",
                namespace: this.getCoreNamespace()
            })
        );

        this.csharp.nameRegistry.trackType(
            this.csharp.classReference({
                namespace: this.getCoreNamespace(),
                name: STRING_ENUM_SERIALIZER_CLASS_NAME
            })
        );

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
                    const enclosingType = this.csharp.nameRegistry.trackType(
                        this.csharpTypeMapper.convertToClassReference(typeDeclaration.name)
                    );
                    if (this.isForwardCompatibleEnumsEnabled()) {
                        // we're generating a string enum
                        // it's going to be a class called Values
                        this.csharp.nameRegistry.trackType(
                            this.csharp.classReference({
                                name: "Values",
                                namespace: this.getNamespace(),
                                enclosingType
                            })
                        );
                    }
                },
                object: (otd: ObjectTypeDeclaration) => {
                    // generate a class reference for the typedeclaration
                    this.csharp.nameRegistry.trackType(
                        this.csharpTypeMapper.convertToClassReference(typeDeclaration.name)
                    );

                    for (const property of otd.properties) {
                        // console.log(`PROP: ${property.name.name.originalName} ${property.valueType.type}`);
                        // const type = this.csharpTypeMapper.convert({ reference: property.valueType });
                        switch (property.valueType.type) {
                            case "named":
                                {
                                    this.csharp.nameRegistry.trackType(
                                        this.csharpTypeMapper.convertToClassReference(property.valueType)
                                    );
                                    const typeDeclaration = this.getTypeDeclarationOrThrow(property.valueType.typeId);
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
                                                        this.csharp.nameRegistry.trackType(
                                                            this.csharpTypeMapper.convertToClassReference(member.type)
                                                        );
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
                                                this.csharp.nameRegistry.trackType(
                                                    this.csharpTypeMapper.convertToClassReference(
                                                        property.valueType.container.optional
                                                    )
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

                        // nameRegistry.trackType( this.csharpTypeMapper.convertToClassReference({named: property.valueType}));
                    }
                },
                union: (utd: UnionTypeDeclaration) => {
                    if (this.shouldGenerateDiscriminatedUnions()) {
                        // return new UnionGenerator(context, typeDeclaration, unionDeclaration).generate();
                        const enclosingType = this.csharp.nameRegistry.trackType(
                            this.csharpTypeMapper.convertToClassReference(typeDeclaration.name)
                        );
                        utd.types.map((type) => {
                            type.discriminantValue.name.pascalCase.safeName;
                            this.csharp.nameRegistry.trackType(
                                this.csharp.classReference({
                                    namespace: enclosingType.namespace,
                                    name: type.discriminantValue.name.pascalCase.safeName,
                                    enclosingType
                                })
                            );
                        });
                        this.csharp.nameRegistry.trackType(
                            this.csharp.classReference({
                                enclosingType,
                                namespace: enclosingType.namespace,
                                name: "JsonConverter"
                            })
                        );
                        if (utd.baseProperties.length > 0) {
                            this.csharp.nameRegistry.trackType(
                                this.csharp.classReference({
                                    enclosingType,
                                    namespace: enclosingType.namespace,
                                    name: "BaseProperties"
                                })
                            );
                        }
                    }
                }
            });
            if (result !== undefined) {
                throw new Error(`Unexpected result from typeDeclaration.shape._visit: ${result}`);
            }
        }

        Object.values(this.ir.types).forEach((typeDeclaration) => {
            const classReference = this.csharpTypeMapper.convertToClassReference(typeDeclaration.name);
            this.csharp.nameRegistry.trackType(classReference);
        });

        this.csharp.nameRegistry.trackType(this.getRawClientClassReference());
        this.csharp.nameRegistry.trackType(this.getRequestOptionsClassReference());
        this.csharp.nameRegistry.trackType(this.getJsonRequestClassReference());
        this.csharp.nameRegistry.trackType(this.getVersionClassReference());
        this.csharp.nameRegistry.trackType(this.getValueConvertReference());
        this.csharp.nameRegistry.trackType(this.getBaseExceptionClassReference());
        this.csharp.nameRegistry.trackType(this.getRootClientClassReference());
        this.csharp.nameRegistry.trackType(this.getRootClientClassReferenceForSnippets());
        this.csharp.nameRegistry.trackType(this.getBaseApiExceptionClassReference());
        this.csharp.nameRegistry.trackType(this.getHeadersClassReference());
        this.csharp.nameRegistry.trackType(this.getClientOptionsClassReference());
        this.csharp.nameRegistry.trackType(this.getRequestOptionsInterfaceReference());
        this.csharp.nameRegistry.trackType(this.getEnvironmentsClassReference());

        // subpackages
        Object.entries(this.ir.subpackages).forEach(([_, subpackage]) => {
            // generate the subpackage class reference and use canonicalization to ensure
            // that it doesn't conflict with any previously generated types or namespaces
            // we don't explicity call canonicalize name now, since we assume it when this.csharp.classReference is called
            // nameRegistry.canonicalizeName(this.getSubpackageClassReference(subpackage));
            this.getSubpackageClassReference(subpackage);
            if (subpackage.service) {
                const service = this.getHttpServiceOrThrow(subpackage.service);
                for (const endpoint of service.endpoints) {
                    endpoint.sdkRequest?.shape._visit({
                        wrapper: (wrapper) => {
                            if (wrapper.wrapperName && subpackage.service) {
                                const requestWrapperReference = this.getRequestWrapperReference(
                                    subpackage.service,
                                    wrapper.wrapperName
                                );
                                // nameRegistry.canonicalizeName(requestWrapperReference);
                                // we don't explicity call canonicalize name now, since we assume it when this.csharp.classReference is called
                            }
                        },
                        justRequestBody: (value) => {
                            // console.log(`REQBODY: for ${subpackage.service}::${endpoint.name.originalName}::${value.requestBodyType.type}`)
                        },
                        _other: (value) => {
                            // console.log(`OTHER: for ${subpackage.service}::${endpoint.name.originalName}::${value.type}`)
                        }
                    });

                    // const requestWrapperReference = this.getRequestWrapperReference(subpackage.service, endpoint.name);
                    // const canonicalizedRequestWrapperReference = nameRegistry.canonicalizeName(requestWrapperReference);
                    // console.log(
                    // `REQWRAP: for ${subpackage.service}::${endpoint.name.originalName} -> ${requestWrapperReference.namespace}.${requestWrapperReference.name} => ${canonicalizedRequestWrapperReference.namespace}.${canonicalizedRequestWrapperReference.name}`
                    //);
                    // nameRegistry.canonicalizeName(this.getRequestWrapperReference(subpackage.service, endpoint.name))
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
                    //   name: typeDeclaration.name.name.originalName,
                    name: `${this.csharpTypeMapper.convertToClassReference(typeDeclaration.name).name}Test`,
                    namespace: this.getTestNamespace()
                });
                /*
                // we don't explicity call canonicalize name now, since we assume it when this.csharp.classReference is called
              const newTestType = nameRegistry.canonicalizeName( testType);
              console.log(`Test: ${testType.namespace}.${testType.name} -> ${newTestType.namespace}.${newTestType.name}`);
              // nameRegistry.trackType(this.csharpTypeMapper.convertToClassReference(typeDeclaration.name));
              */
            }

            if (this.shouldGenerateDiscriminatedUnions()) {
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
                        //   name: typeDeclaration.name.name.originalName,
                        name: `${this.csharpTypeMapper.convertToClassReference(typeDeclaration.name).name}Test`,
                        namespace: this.getTestNamespace()
                    });
                    // we don't explicity call canonicalize name now, since we assume it when this.csharp.classReference is called
                    // const newTestType = nameRegistry.canonicalizeName( testType);
                    // console.log(`Union Test: ${testType.namespace}.${testType.name} -> ${newTestType.namespace}.${newTestType.name}`);
                }
            }

            if (this.customConfig["generate-error-types"] ?? true) {
                for (const each of Object.values(this.ir.errors)) {
                    this.csharp.nameRegistry.trackType(this.getExceptionClassReference(each.name));
                }
            }
            this.csharp.nameRegistry.trackType(
                this.csharp.classReference({
                    name: "TestClient",
                    namespace: this.getTestNamespace()
                })
            );
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
                    continue;
                }

                this.csharp.classReference({
                    name: endpoint.name.pascalCase.safeName + "Test",
                    namespace: this.getTestNamespace()
                });
            }
        }

        // after generating the names for everything, freeze the class references
        this.csharp.freezeClassReferences();
        console.log("=== ENDING PRECALCULATE ===");
    }
}

function stripNonAlphanumeric(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, "");
}
