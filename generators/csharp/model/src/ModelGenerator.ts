import { csharp, CSharpFile } from "@fern-api/csharp-codegen";
import { GeneratorContext } from "@fern-api/generator-commons";
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

class ModelGenerator {
    private rootModule: string;

    private types: Map<TypeId, TypeDeclaration>;
    private flattenedProperties: Map<TypeId, ObjectProperty[]>;
    private generatorContext: GeneratorContext;

    constructor(
        rootModule: string,
        intermediateRepresentation: IntermediateRepresentation,
        generatorContext: GeneratorContext
    ) {
        this.rootModule = rootModule;
        this.generatorContext = generatorContext;

        this.types = new Map();
        this.flattenedProperties = new Map();

        for (const type of Object.values(intermediateRepresentation.types)) {
            this.types.set(type.name.typeId, type);
        }

        for (const typeId of this.types.keys()) {
            this.flattenedProperties.set(typeId, this.getFlattenedProperties(typeId));
        }
    }

    // STOLEN FROM: ruby/TypesGenerator.ts
    // We need a better way to share this sort of ir-processing logic.
    //
    // We pull all inherited properties onto the object because C#
    // does not allow for multiple inheritence of classes, and creating interfaces feels
    // heavy-handed + duplicative.
    private getFlattenedProperties(typeId: TypeId): ObjectProperty[] {
        this.generatorContext.logger.debug(`Getting flattened properties for ${typeId}`);
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

    private generateAliasClass(
        typeId: TypeId,
        aliasTypeDeclaration: AliasTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): csharp.Class {
        throw new Error("Not implemented");
    }

    private generateEnumClass(enumTypeDeclaration: EnumTypeDeclaration, typeDeclaration: TypeDeclaration): Class {
        throw new Error("Not implemented");
    }

    private generateObjectClass(
        typeId: TypeId,
        objectTypeDeclaration: ObjectTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): csharp.Class {
        const class_ = csharp.class_({
            name: typeDeclaration.name.name.pascalCase.safeName,
            namespace: csharp.Class.getNamespaceFromFernFilepath(this.rootModule, typeDeclaration.name.fernFilepath),
            partial: false,
            access: "public"
        });

        const properties = this.flattenedProperties.get(typeId) ?? objectTypeDeclaration.properties;
        properties.forEach((property) => {
            class_.addField(
                csharp.field({
                    name: property.name.name.pascalCase.safeName,
                    type: csharp.Type.typeFromTypeReference(this.rootModule, property.valueType),
                    access: "public",
                    get: true,
                    init: true,
                    summary: property.docs
                })
            );
        });

        return class_;
    }

    private generateUnionClass(
        typeId: TypeId,
        unionTypeDeclaration: UnionTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): csharp.Class {
        throw new Error("Not implemented");
    }

    private generateUndiscriminatedUnionClass(
        typeId: TypeId,
        undiscriminatedUnionTypeDeclaration: UndiscriminatedUnionTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): csharp.Class {
        throw new Error("Not implemented");
    }

    private generateUnkownClass(shape: Type): csharp.Class | undefined {
        throw new Error("Unknown type declaration shape: " + shape.type);
    }

    public generateTypes(): CSharpFile[] {
        this.generatorContext.logger.debug("Generating all types...");
        const typeFiles: CSharpFile[] = [];
        for (const [typeId, typeDeclaration] of this.types.entries()) {
            const filePath = CSharpFile.getFilePathFromFernFilePath(typeDeclaration.name.fernFilepath);
            this.generatorContext.logger.debug(`Generating type: ${typeId}`);
            const generatedClass = typeDeclaration.shape._visit<csharp.Class | undefined>({
                alias: (atd: AliasTypeDeclaration) => this.generateAliasClass(typeId, atd, typeDeclaration),
                enum: (etd: EnumTypeDeclaration) => this.generateEnumClass(etd, typeDeclaration),
                object: (otd: ObjectTypeDeclaration) => this.generateObjectClass(typeId, otd, typeDeclaration),
                union: (utd: UnionTypeDeclaration) => this.generateUnionClass(typeId, utd, typeDeclaration),
                undiscriminatedUnion: (uutd: UndiscriminatedUnionTypeDeclaration) =>
                    this.generateUndiscriminatedUnionClass(typeId, uutd, typeDeclaration),
                _other: () => this.generateUnkownClass(typeDeclaration.shape)
            });

            if (generatedClass != null) {
                typeFiles.push(new CSharpFile({ clazz: generatedClass, directory: filePath }));
            }
        }
        return typeFiles;
    }
}
