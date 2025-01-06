import { camelCase, upperFirst } from "lodash-es";

import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import {
    FernFilepath,
    HttpHeader,
    IntermediateRepresentation,
    Name,
    PrimitiveType,
    PrimitiveTypeV1,
    TypeDeclaration,
    TypeId,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";

import { convertReadOnlyPrimitiveTypes, csharp } from "..";
import {
    COLLECTION_ITEM_SERIALIZER_CLASS_NAME,
    CONSTANTS_CLASS_NAME,
    DATETIME_SERIALIZER_CLASS_NAME,
    ENUM_SERIALIZER_CLASS_NAME,
    JSON_UTILS_CLASS_NAME,
    ONE_OF_SERIALIZER_CLASS_NAME,
    STRING_ENUM_SERIALIZER_CLASS_NAME
} from "../AsIs";
import { Type } from "../ast";
import { BaseCsharpCustomConfigSchema } from "../custom-config/BaseCsharpCustomConfigSchema";
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

    public getJsonExceptionClassReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: "System.Text.Json",
            name: "JsonException"
        });
    }

    public getJTokenClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "JToken",
            namespace: "Newtonsoft.Json.Linq"
        });
    }

    public getFluentAssetionsJsonClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "",
            namespace: "FluentAssertions.Json"
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

    public getAsUndiscriminatedUnionTypeDeclaration(
        reference: TypeReference
    ): { declaration: UndiscriminatedUnionTypeDeclaration; isList: boolean } | undefined {
        if (reference.type === "container" && reference.container.type === "optional") {
            return this.getAsUndiscriminatedUnionTypeDeclaration(reference.container.optional);
        }
        if (reference.type === "container" && reference.container.type === "list") {
            const maybeDeclaration = this.getAsUndiscriminatedUnionTypeDeclaration(reference.container.list);
            if (maybeDeclaration != null) {
                return {
                    ...maybeDeclaration,
                    isList: true
                };
            }
        }

        if (reference.type !== "named") {
            return undefined;
        }

        let declaration = this.getTypeDeclarationOrThrow(reference.typeId);
        if (this.protobufResolver.isAnyWellKnownProtobufType(declaration.name.typeId)) {
            return undefined;
        }

        if (declaration.shape.type === "undiscriminatedUnion") {
            return { declaration: declaration.shape, isList: false };
        }

        // handle aliases by visiting resolved types
        if (declaration.shape.type === "alias") {
            if (declaration.shape.resolvedType.type === "named") {
                declaration = this.getTypeDeclarationOrThrow(reference.typeId);
                if (declaration.shape.type === "undiscriminatedUnion") {
                    return { declaration: declaration.shape, isList: false };
                }
            } else if (
                declaration.shape.resolvedType.type === "container" &&
                declaration.shape.resolvedType.container.type === "optional"
            ) {
                return this.getAsUndiscriminatedUnionTypeDeclaration(declaration.shape.resolvedType.container.optional);
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
                return typeReference.container.type === "optional";
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
                return typeReference.container.type === "optional";
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
    public printType(type: Type): string {
        return type.toString({
            namespace: this.getNamespace(),
            allNamespaceSegments: this.getAllNamespaceSegments(),
            allTypeClassReferences: this.getAllTypeClassReferences(),
            rootNamespace: this.getNamespace(),
            customConfig: this.customConfig,
            skipImports: true
        });
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
