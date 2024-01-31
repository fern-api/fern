import { RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorContext } from "@fern-api/generator-commons";
import { ClassReferenceFactory, Class_, GeneratedRubyFile, Module_ } from "@fern-api/ruby-codegen";
import {
    AliasTypeDeclaration,
    DeclaredTypeName,
    EnumTypeDeclaration,
    IntermediateRepresentation,
    ObjectProperty,
    ObjectTypeDeclaration,
    ResolvedNamedType,
    Type,
    TypeDeclaration,
    TypeId,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import {
    generateAliasDefinitionFromTypeDeclaration,
    generateEnumDefinitionFromTypeDeclaration,
    generateSerializableObjectFromTypeDeclaration,
    generateUndiscriminatedUnionFromTypeDeclaration,
    generateUnionFromTypeDeclaration
} from "./AbstractionUtilities";

// TODO: This (as an abstract class) will probably be used across CLIs
export class TypesGenerator {
    public generatedClasses: Map<TypeId, Class_>;
    public resolvedReferences: Map<TypeId, TypeId>;
    public flattenedProperties: Map<TypeId, ObjectProperty[]>;

    private types: Map<TypeId, TypeDeclaration>;
    private gc: GeneratorContext;
    private classReferenceFactory: ClassReferenceFactory;
    private gemName: string;
    private clientName: string;

    constructor(
        gemName: string,
        clientName: string,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ) {
        this.types = new Map();
        this.flattenedProperties = new Map();
        this.generatedClasses = new Map();
        this.resolvedReferences = new Map();
        this.gc = generatorContext;

        this.gemName = gemName;
        this.clientName = clientName;

        // For convenience just get what's inheriting what ahead of time.
        this.gc.logger.debug(`Found ${intermediateRepresentation.types.length} types to generate`);
        for (const type of Object.values(intermediateRepresentation.types)) {
            this.types.set(type.name.typeId, type);
        }

        for (const typeId of this.types.keys()) {
            this.flattenedProperties.set(typeId, this.getFlattenedProperties(typeId));
        }

        this.classReferenceFactory = new ClassReferenceFactory(this.types);
    }

    // We pull all inherited properties onto the object because Ruby
    // does not allow for multiple inheritence of classes, and does not
    // have a concept of interfaces. We could leverage Modules, however inheriting
    // properties from Modules appears non-standard (functions is the more common usecase)
    private getFlattenedProperties(typeId: TypeId): ObjectProperty[] {
        const td = this.types.get(typeId);
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

    private generateAliasFile(
        typeId: TypeId,
        aliasTypeDeclaration: AliasTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const aliasExpression = generateAliasDefinitionFromTypeDeclaration(
            this.classReferenceFactory,
            aliasTypeDeclaration,
            typeDeclaration
        );
        aliasTypeDeclaration.resolvedType._visit<void>({
            container: () => {
                return;
            },
            named: (rnt: ResolvedNamedType) => {
                this.resolvedReferences.set(typeId, rnt.name.typeId);
            },
            primitive: () => {
                return;
            },
            unknown: () => {
                return;
            },
            _other: () => {
                return;
            }
        });

        const rootNode = Module_.wrapInModules(this.clientName, aliasExpression, typeDeclaration.name.fernFilepath);
        return new GeneratedRubyFile({
            rootNode,
            directoryPrefix: RelativeFilePath.of(this.gemName),
            name: typeDeclaration.name
        });
    }
    private generateEnumFile(
        enumTypeDeclaration: EnumTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const enumExpression = generateEnumDefinitionFromTypeDeclaration(enumTypeDeclaration, typeDeclaration);
        const rootNode = Module_.wrapInModules(this.clientName, enumExpression, typeDeclaration.name.fernFilepath);
        return new GeneratedRubyFile({
            rootNode,
            directoryPrefix: RelativeFilePath.of(this.gemName),
            name: typeDeclaration.name
        });
    }
    private generateObjectFile(
        typeId: TypeId,
        objectTypeDeclaration: ObjectTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const serializableObject = generateSerializableObjectFromTypeDeclaration(
            this.classReferenceFactory,
            this.flattenedProperties,
            typeId,
            objectTypeDeclaration,
            typeDeclaration
        );
        this.generatedClasses.set(typeId, serializableObject);
        const rootNode = Module_.wrapInModules(this.clientName, serializableObject, typeDeclaration.name.fernFilepath);
        return new GeneratedRubyFile({
            rootNode,
            directoryPrefix: RelativeFilePath.of(this.gemName),
            name: typeDeclaration.name
        });
    }
    private generateUnionFile(
        typeId: TypeId,
        unionTypeDeclaration: UnionTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const unionObject = generateUnionFromTypeDeclaration(
            this.classReferenceFactory,
            this.flattenedProperties,
            typeId,
            unionTypeDeclaration,
            typeDeclaration
        );
        this.generatedClasses.set(typeId, unionObject);
        const rootNode = Module_.wrapInModules(this.clientName, unionObject, typeDeclaration.name.fernFilepath);
        return new GeneratedRubyFile({
            rootNode,
            directoryPrefix: RelativeFilePath.of(this.gemName),
            name: typeDeclaration.name
        });
    }
    private generateUndiscriminatedUnionFile(
        typeId: TypeId,
        undiscriminatedUnionTypeDeclaration: UndiscriminatedUnionTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const unionObject = generateUndiscriminatedUnionFromTypeDeclaration(
            this.classReferenceFactory,
            undiscriminatedUnionTypeDeclaration,
            typeDeclaration
        );

        this.generatedClasses.set(typeId, unionObject);
        const rootNode = Module_.wrapInModules(this.clientName, unionObject, typeDeclaration.name.fernFilepath);
        return new GeneratedRubyFile({
            rootNode,
            directoryPrefix: RelativeFilePath.of(this.gemName),
            name: typeDeclaration.name
        });
    }
    private generateUnkownFile(shape: Type): GeneratedRubyFile | undefined {
        throw new Error("Unknown type declaration shape: " + shape.type);
    }

    public generateFiles(): Map<TypeId, GeneratedRubyFile> {
        const typeFiles = new Map<TypeId, GeneratedRubyFile>();
        for (const [typeId, typeDeclaration] of this.types.entries()) {
            const generatedFile = typeDeclaration.shape._visit<GeneratedRubyFile | undefined>({
                alias: (atd: AliasTypeDeclaration) => this.generateAliasFile(typeId, atd, typeDeclaration),
                enum: (etd: EnumTypeDeclaration) => this.generateEnumFile(etd, typeDeclaration),
                object: (otd: ObjectTypeDeclaration) => this.generateObjectFile(typeId, otd, typeDeclaration),
                union: (utd: UnionTypeDeclaration) => this.generateUnionFile(typeId, utd, typeDeclaration),
                undiscriminatedUnion: (uutd: UndiscriminatedUnionTypeDeclaration) =>
                    this.generateUndiscriminatedUnionFile(typeId, uutd, typeDeclaration),
                _other: () => this.generateUnkownFile(typeDeclaration.shape)
            });

            if (generatedFile != null) {
                typeFiles.set(typeId, generatedFile);
            }
        }

        return typeFiles;
    }

    public getResolvedClasses(): Map<TypeId, Class_> {
        this.resolvedReferences.forEach((typeId, resolvedTypeId) => {
            const resolvedClass = this.generatedClasses.get(resolvedTypeId);
            if (resolvedClass !== undefined) {
                this.generatedClasses.set(typeId, resolvedClass);
            }
        });
        return this.generatedClasses;
    }
}
