import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/generator-commons";
import {
    FernFilepath,
    IntermediateRepresentation,
    Name,
    ProtobufFile,
    ProtobufType,
    TypeDeclaration,
    TypeId,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration,
    WellKnownProtobufType
} from "@fern-fern/ir-sdk/api";
import { camelCase, upperFirst } from "lodash-es";
import { csharp } from "..";
import {
    COLLECTION_ITEM_SERIALIZER_CLASS_NAME,
    CONSTANTS_CLASS_NAME,
    DATETIME_SERIALIZER_CLASS_NAME,
    JSON_UTILS_CLASS_NAME,
    ONE_OF_SERIALIZER_CLASS_NAME,
    STRING_ENUM_SERIALIZER_CLASS_NAME
} from "../AsIs";
import { BaseCsharpCustomConfigSchema } from "../custom-config/BaseCsharpCustomConfigSchema";
import { CsharpProject } from "../project";
import { Namespace } from "../project/CSharpFile";
import { CORE_DIRECTORY_NAME, PUBLIC_CORE_DIRECTORY_NAME } from "../project/CsharpProject";
import { ResolvedWellKnownProtobufType } from "../ResolvedWellKnownProtobufType";
import { CsharpTypeMapper } from "./CsharpTypeMapper";

export abstract class AbstractCsharpGeneratorContext<
    CustomConfig extends BaseCsharpCustomConfigSchema
> extends AbstractGeneratorContext {
    private namespace: string;
    public readonly project: CsharpProject;
    public readonly csharpTypeMapper: CsharpTypeMapper;
    public publishConfig: FernGeneratorExec.NugetGithubPublishInfo | undefined;
    private allNamespaceSegments?: Set<string>;
    private allTypeClassReferences?: Map<string, Set<Namespace>>;

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
        this.project = new CsharpProject(this, this.namespace);
        this.csharpTypeMapper = new CsharpTypeMapper(this);
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

    public getCoreNamespace(): string {
        return `${this.namespace}.Core`;
    }

    public getTestNamespace(): string {
        return `${this.namespace}.Test`;
    }

    public hasGrpcEndpoints(): boolean {
        // TODO: Replace this with the this.ir.sdkConfig.hasGrpcEndpoints property (when available).
        return Object.values(this.ir.services).some((service) => service.transport?.type === "grpc");
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

    public getNamespaceFromProtobufFileOrThrow(protobufFile: ProtobufFile): string {
        const namespace = protobufFile.options?.csharp?.namespace;
        if (namespace == null) {
            throw new Error(
                `The 'csharp_namespace' file option must be declared in Protobuf file ${protobufFile.filepath}`
            );
        }
        return namespace;
    }

    public resolveWellKnownProtobufTypeOrThrow(
        wellKnownProtobufType: WellKnownProtobufType
    ): ResolvedWellKnownProtobufType {
        const resolvedType = this.resolveWellKnownProtobufType(wellKnownProtobufType);
        if (resolvedType === undefined) {
            throw new Error(`Well-known Protobuf type "${wellKnownProtobufType.type}" could not be found.`);
        }
        return resolvedType;
    }

    public resolveWellKnownProtobufType(
        wellKnownProtobufType: WellKnownProtobufType
    ): ResolvedWellKnownProtobufType | undefined {
        for (const [typeId, typeDeclaration] of Object.entries(this.ir.types)) {
            if (this.isWellKnownProtobufType({ typeId, wellKnownProtobufType })) {
                return {
                    typeDeclaration,
                    wellKnownProtobufType: wellKnownProtobufType
                };
            }
        }
        return undefined;
    }

    public isProtobufStruct(typeId: TypeId): boolean {
        return this.isWellKnownProtobufType({
            typeId,
            wellKnownProtobufType: WellKnownProtobufType.struct()
        });
    }

    public isProtobufValue(typeId: TypeId): boolean {
        return this.isWellKnownProtobufType({
            typeId,
            wellKnownProtobufType: WellKnownProtobufType.value()
        });
    }

    public isWellKnownProtobufType({
        typeId,
        wellKnownProtobufType
    }: {
        typeId: TypeId;
        wellKnownProtobufType: WellKnownProtobufType;
    }): boolean {
        const protobufType = this.getProtobufTypeForTypeId(typeId);
        if (protobufType == null) {
            return false;
        }
        return protobufType.type === "wellKnown" && protobufType.value.type === wellKnownProtobufType.type;
    }

    public getProtobufTypeForTypeId(typeId: TypeId): ProtobufType | undefined {
        const typeDeclaration = this.getTypeDeclaration(typeId);
        if (typeDeclaration == null || typeDeclaration.source == null) {
            return undefined;
        }
        return typeDeclaration.source.type === "proto" ? typeDeclaration.source.value : undefined;
    }

    public getStringEnumSerializerClassReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: STRING_ENUM_SERIALIZER_CLASS_NAME
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
        if (this.isProtobufStruct(declaration.name.typeId) || this.isProtobufValue(declaration.name.typeId)) {
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

    public abstract getCoreAsIsFiles(): string[];

    public abstract getPublicCoreAsIsFiles(): string[];

    public abstract getDirectoryForTypeId(typeId: TypeId): string;

    public abstract getNamespaceForTypeId(typeId: TypeId): string;

    public abstract getExtraDependencies(): Record<string, string>;
}
