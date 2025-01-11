import { AbstractGeneratorContext } from "@fern-api/base-generator";
import { ClassReferenceFactory, Class_, GeneratedRubyFile, LocationGenerator, Module_ } from "@fern-api/ruby-codegen";

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
import { RootFile } from "./RootFile";

// TODO: This (as an abstract class) will probably be used across CLIs
export class TypesGenerator {
    public generatedClasses: Map<TypeId, Class_>;
    public resolvedReferences: Map<TypeId, TypeId>;
    public flattenedProperties: Map<TypeId, ObjectProperty[]>;
    public classReferenceFactory: ClassReferenceFactory;
    public locationGenerator: LocationGenerator;

    private types: Map<TypeId, TypeDeclaration>;
    private gc: AbstractGeneratorContext;
    private gemName: string;
    private clientName: string;

    constructor({
        gemName,
        clientName,
        generatorContext,
        intermediateRepresentation,
        shouldFlattenModules
    }: {
        gemName: string;
        clientName: string;
        generatorContext: AbstractGeneratorContext;
        intermediateRepresentation: IntermediateRepresentation;
        shouldFlattenModules: boolean;
    }) {
        this.types = new Map();
        this.flattenedProperties = new Map();
        this.generatedClasses = new Map();
        this.resolvedReferences = new Map();
        this.gc = generatorContext;

        this.gemName = gemName;
        this.clientName = clientName;

        // For convenience just get what's inheriting what ahead of time.
        this.gc.logger.debug(
            `[Ruby] Found ${Object.values(intermediateRepresentation.types).length} types to generate`
        );
        for (const type of Object.values(intermediateRepresentation.types)) {
            this.types.set(type.name.typeId, type);
        }

        this.gc.logger.debug("[Ruby] Flattening properties across objects prior to file creation.");
        for (const typeId of this.types.keys()) {
            this.flattenedProperties.set(typeId, this.getFlattenedProperties(typeId));
        }
        this.gc.logger.debug("[Ruby] Done flattening properties.");

        this.locationGenerator = new LocationGenerator(this.gemName, this.clientName, shouldFlattenModules);
        this.classReferenceFactory = new ClassReferenceFactory(this.types, this.locationGenerator);
    }

    // We pull all inherited properties onto the object because Ruby
    // does not allow for multiple inheritence of classes, and does not
    // have a concept of interfaces. We could leverage Modules, however inheriting
    // properties from Modules appears non-standard (functions is the more common usecase)
    private getFlattenedProperties(typeId: TypeId): ObjectProperty[] {
        const td = this.types.get(typeId);
        return td === undefined
            ? []
            : (this.flattenedProperties.get(typeId) ??
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
                  }));
    }

    // Create a main file for the gem, this just contains imports to all the types
    private generateRootFile(): GeneratedRubyFile {
        return new GeneratedRubyFile({
            rootNode: new RootFile(Array.from(this.classReferenceFactory.generatedReferences.values())),
            fullPath: this.gemName
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

        // For simplicity we do not generate aliases for primitive types
        const shouldGenerate = aliasTypeDeclaration.resolvedType._visit<boolean>({
            container: () => {
                return true;
            },
            named: (rnt: ResolvedNamedType) => {
                this.resolvedReferences.set(typeId, rnt.name.typeId);
                return true;
            },
            primitive: () => {
                return false;
            },
            unknown: () => {
                return true;
            },
            _other: () => {
                return true;
            }
        });

        if (shouldGenerate) {
            const rootNode = Module_.wrapInModules({
                locationGenerator: this.locationGenerator,
                child: aliasExpression,
                path: typeDeclaration.name.fernFilepath,
                isType: true
            });
            return new GeneratedRubyFile({
                rootNode,
                fullPath: this.locationGenerator.getLocationForTypeDeclaration(typeDeclaration.name)
            });
        }
        return;
    }
    private generateEnumFile(
        enumTypeDeclaration: EnumTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const enumExpression = generateEnumDefinitionFromTypeDeclaration(
            this.classReferenceFactory,
            enumTypeDeclaration,
            typeDeclaration
        );
        const rootNode = Module_.wrapInModules({
            locationGenerator: this.locationGenerator,
            child: enumExpression,
            path: typeDeclaration.name.fernFilepath,
            isType: true
        });
        return new GeneratedRubyFile({
            rootNode,
            fullPath: this.locationGenerator.getLocationForTypeDeclaration(typeDeclaration.name)
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
        const rootNode = Module_.wrapInModules({
            locationGenerator: this.locationGenerator,
            child: serializableObject,
            path: typeDeclaration.name.fernFilepath,
            isType: true
        });
        return new GeneratedRubyFile({
            rootNode,
            fullPath: this.locationGenerator.getLocationForTypeDeclaration(typeDeclaration.name)
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
        const rootNode = Module_.wrapInModules({
            locationGenerator: this.locationGenerator,
            child: unionObject,
            path: typeDeclaration.name.fernFilepath,
            isType: true
        });
        return new GeneratedRubyFile({
            rootNode,
            fullPath: this.locationGenerator.getLocationForTypeDeclaration(typeDeclaration.name)
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
        const rootNode = Module_.wrapInModules({
            locationGenerator: this.locationGenerator,
            child: unionObject,
            path: typeDeclaration.name.fernFilepath,
            isType: true
        });
        return new GeneratedRubyFile({
            rootNode,
            fullPath: this.locationGenerator.getLocationForTypeDeclaration(typeDeclaration.name)
        });
    }
    private generateUnkownFile(shape: Type): GeneratedRubyFile | undefined {
        throw new Error("Unknown type declaration shape: " + shape.type);
    }

    public generateFiles(includeRootImports = false): GeneratedRubyFile[] {
        const typeFiles: GeneratedRubyFile[] = [];
        for (const [typeId, typeDeclaration] of this.types.entries()) {
            this.gc.logger.debug(`[Ruby] Generating class file for type: ${typeId}`);
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
                typeFiles.push(generatedFile);
            }
        }

        if (includeRootImports) {
            this.gc.logger.debug("[Ruby] Generating root file for all types.");
            typeFiles.push(this.generateRootFile());
        }

        return typeFiles;
    }

    public getResolvedClasses(): Map<TypeId, Class_> {
        this.gc.logger.debug("[Ruby] Gathering resolved types.");
        this.resolvedReferences.forEach((typeId, resolvedTypeId) => {
            const resolvedClass = this.generatedClasses.get(resolvedTypeId);
            if (resolvedClass !== undefined) {
                this.generatedClasses.set(typeId, resolvedClass);
            }
        });
        this.gc.logger.debug("[Ruby] Done gathering resolved types.");
        return this.generatedClasses;
    }
}
