import { RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorContext } from "@fern-api/generator-commons";
import { ClassReferenceFactory, GeneratedRubyFile, Module_ } from "@fern-api/ruby-codegen";
import {
    AliasTypeDeclaration,
    DeclaredTypeName,
    EnumTypeDeclaration,
    IntermediateRepresentation,
    ObjectProperty,
    ObjectTypeDeclaration,
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
    private types: Map<TypeId, TypeDeclaration>;
    private flattenedProperties: Map<TypeId, ObjectProperty[]>;
    private gc: GeneratorContext;
    private classReferenceFactory: ClassReferenceFactory;
    private directoryPrefix: RelativeFilePath;

    constructor(
        directoryPrefix: RelativeFilePath,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ) {
        this.types = new Map();
        this.flattenedProperties = new Map();
        this.gc = generatorContext;

        this.directoryPrefix = directoryPrefix;

        // For convenience just get what's inheriting what ahead of time.
        this.gc.logger.debug(`[TESTING] Found this many types: ${intermediateRepresentation.types.length}`);
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
        aliasTypeDeclaration: AliasTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const aliasExpression = generateAliasDefinitionFromTypeDeclaration(
            this.classReferenceFactory,
            aliasTypeDeclaration,
            typeDeclaration
        );
        const rootNode = Module_.wrapInModules(
            this.directoryPrefix,
            aliasExpression,
            typeDeclaration.name.fernFilepath
        );
        return new GeneratedRubyFile({ rootNode, directoryPrefix: this.directoryPrefix, name: typeDeclaration.name });
    }
    private generateEnumFile(
        enumTypeDeclaration: EnumTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const enumExpression = generateEnumDefinitionFromTypeDeclaration(enumTypeDeclaration, typeDeclaration);
        const rootNode = Module_.wrapInModules(this.directoryPrefix, enumExpression, typeDeclaration.name.fernFilepath);
        return new GeneratedRubyFile({ rootNode, directoryPrefix: this.directoryPrefix, name: typeDeclaration.name });
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
        const rootNode = Module_.wrapInModules(
            this.directoryPrefix,
            serializableObject,
            typeDeclaration.name.fernFilepath
        );
        return new GeneratedRubyFile({ rootNode, directoryPrefix: this.directoryPrefix, name: typeDeclaration.name });
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
        const rootNode = Module_.wrapInModules(this.directoryPrefix, unionObject, typeDeclaration.name.fernFilepath);
        return new GeneratedRubyFile({ rootNode, directoryPrefix: this.directoryPrefix, name: typeDeclaration.name });
    }
    private generateUndiscriminatedUnionFile(
        undiscriminatedUnionTypeDeclaration: UndiscriminatedUnionTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const unionObject = generateUndiscriminatedUnionFromTypeDeclaration(
            this.classReferenceFactory,
            undiscriminatedUnionTypeDeclaration,
            typeDeclaration
        );
        const rootNode = Module_.wrapInModules(this.directoryPrefix, unionObject, typeDeclaration.name.fernFilepath);
        return new GeneratedRubyFile({ rootNode, directoryPrefix: this.directoryPrefix, name: typeDeclaration.name });
    }
    private generateUnkownFile(shape: Type): GeneratedRubyFile | undefined {
        throw new Error("Unknown type declaration shape: " + shape.type);
    }

    public generateFiles(): Map<TypeId, GeneratedRubyFile> {
        const typeFiles = new Map<TypeId, GeneratedRubyFile>();
        for (const [typeId, typeDeclaration] of this.types.entries()) {
            const generatedFile = typeDeclaration.shape._visit<GeneratedRubyFile | undefined>({
                alias: (atd: AliasTypeDeclaration) => this.generateAliasFile(atd, typeDeclaration),
                enum: (etd: EnumTypeDeclaration) => this.generateEnumFile(etd, typeDeclaration),
                object: (otd: ObjectTypeDeclaration) => this.generateObjectFile(typeId, otd, typeDeclaration),
                union: (utd: UnionTypeDeclaration) => this.generateUnionFile(typeId, utd, typeDeclaration),
                undiscriminatedUnion: (uutd: UndiscriminatedUnionTypeDeclaration) =>
                    this.generateUndiscriminatedUnionFile(uutd, typeDeclaration),
                _other: () => this.generateUnkownFile(typeDeclaration.shape)
            });

            if (generatedFile != null) {
                typeFiles.set(typeId, generatedFile);
            }
        }

        return typeFiles;
    }
}
