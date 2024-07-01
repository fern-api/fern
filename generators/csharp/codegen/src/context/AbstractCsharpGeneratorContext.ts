import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/generator-commons";
import {
    AliasTypeDeclaration,
    DeclaredTypeName,
    IntermediateRepresentation,
    Name,
    ObjectProperty,
    ObjectTypeDeclaration,
    TypeDeclaration,
    TypeId,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { camelCase, upperFirst } from "lodash-es";
import { csharp } from "..";
import {
    COLLECTION_ITEM_SERIALIZER_CLASS_NAME,
    ONE_OF_SERIALIZER_CLASS_NAME,
    STRING_ENUM_SERIALIZER_CLASS_NAME
} from "../AsIs";
import { BaseCsharpCustomConfigSchema } from "../custom-config/BaseCsharpCustomConfigSchema";
import { CsharpProject } from "../project";
import { CORE_DIRECTORY_NAME } from "../project/CsharpProject";
import { CsharpTypeMapper } from "./CsharpTypeMapper";

export abstract class AbstractCsharpGeneratorContext<
    CustomConfig extends BaseCsharpCustomConfigSchema
> extends AbstractGeneratorContext {
    private namespace: string;
    public readonly project: CsharpProject;
    public readonly csharpTypeMapper: CsharpTypeMapper;
    public readonly flattenedProperties: Map<TypeId, ObjectProperty[]> = new Map();
    public publishConfig: FernGeneratorExec.NugetGithubPublishInfo | undefined;

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
        for (const typeId of Object.keys(ir.types)) {
            this.flattenedProperties.set(typeId, this.getFlattenedProperties(typeId));
        }
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

    public getStringEnumSerializerClassReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: STRING_ENUM_SERIALIZER_CLASS_NAME
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
        const typeDeclaration = this.ir.types[typeId];
        if (typeDeclaration == null) {
            throw new Error(`Type declaration with id ${typeId} not found`);
        }
        return typeDeclaration;
    }

    public getCoreDirectory(): RelativeFilePath {
        return RelativeFilePath.of(CORE_DIRECTORY_NAME);
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

    public abstract getAsIsFiles(): string[];

    public abstract getDirectoryForTypeId(typeId: TypeId): string;

    public abstract getNamespaceForTypeId(typeId: TypeId): string;

    public abstract getExtraDependencies(): Record<string, string>;

    // STOLEN FROM: ruby/TypesGenerator.ts
    // We need a better way to share this sort of ir-processing logic.
    //
    // We pull all inherited properties onto the object because C#
    // does not allow for multiple inheritence of classes, and creating interfaces feels
    // heavy-handed + duplicative.
    private getFlattenedProperties(typeId: TypeId): ObjectProperty[] {
        const td = this.getTypeDeclarationOrThrow(typeId);
        return td === undefined
            ? []
            : this.flattenedProperties.get(typeId) ??
                  td.shape._visit<ObjectProperty[]>({
                      alias: (atd: AliasTypeDeclaration) => {
                          return atd.aliasOf._visit<ObjectProperty[]>({
                              container: () => [],
                              named: (dtn: DeclaredTypeName) => this.getFlattenedProperties(dtn.typeId),
                              primitive: () => [],
                              unknown: () => [],
                              _other: () => []
                          });
                      },
                      enum: () => {
                          this.flattenedProperties.set(typeId, []);
                          return [];
                      },
                      object: (otd: ObjectTypeDeclaration) => {
                          const props = [
                              ...otd.properties,
                              ...otd.extends.flatMap((eo) => this.getFlattenedProperties(eo.typeId))
                          ];
                          this.flattenedProperties.set(typeId, props);
                          return props;
                      },
                      union: (utd: UnionTypeDeclaration) => {
                          const props = [
                              ...utd.baseProperties,
                              ...utd.extends.flatMap((eo) => this.getFlattenedProperties(eo.typeId))
                          ];
                          this.flattenedProperties.set(typeId, props);
                          return props;
                      },
                      undiscriminatedUnion: () => {
                          this.flattenedProperties.set(typeId, []);
                          return [];
                      },
                      _other: () => {
                          throw new Error("Attempting to type declaration for an unknown type.");
                      }
                  });
    }
}
