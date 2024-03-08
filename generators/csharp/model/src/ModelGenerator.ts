import { csharp, CSharpFile } from "@fern-api/csharp-codegen";
import { CodeBlock } from "@fern-api/csharp-codegen/lib/ast";
import { GeneratorContext } from "@fern-api/generator-commons";
import {
    AliasTypeDeclaration,
    DeclaredTypeName,
    EnumTypeDeclaration,
    IntermediateRepresentation,
    Name,
    ObjectProperty,
    ObjectTypeDeclaration,
    Type,
    TypeDeclaration,
    TypeId,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { ReferenceGenerator } from "./ReferenceGenerator";

export class ModelGenerator {
    private rootModule: string;

    private types: Map<TypeId, TypeDeclaration>;
    private flattenedProperties: Map<TypeId, ObjectProperty[]>;
    private generatorContext: GeneratorContext;
    private referenceGenerator: ReferenceGenerator;

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

        this.referenceGenerator = new ReferenceGenerator(this.types);
    }

    // Field and Class names follow pascal case, so just make a utility
    private _getNameFromIrName(name: Name): string {
        return name.pascalCase.safeName;
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

    private generateAliasClass(typeId: TypeId): undefined {
        // C# doesn't have a direct equivalent to an alias, so we do not generate a class here.
        // The closest thing to aliases are leveraging a `using` statement, but this seems to be file specific.
        // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/proposals/csharp-12.0/using-alias-types
        this.generatorContext.logger.debug(`Skipping generation of alias type: ${typeId}`);
        return;
    }

    private generateEnumClass(
        enumTypeDeclaration: EnumTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): csharp.Class {
        const class_ = csharp.class_({
            name: this._getNameFromIrName(typeDeclaration.name.name),
            namespace: csharp.Class.getNamespaceFromFernFilepath(this.rootModule, typeDeclaration.name.fernFilepath),
            partial: false,
            access: "public"
        });

        return class_;
    }

    private generateObjectClass(
        typeId: TypeId,
        objectTypeDeclaration: ObjectTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): csharp.Class {
        const class_ = csharp.class_({
            name: this._getNameFromIrName(typeDeclaration.name.name),
            namespace: csharp.Class.getNamespaceFromFernFilepath(this.rootModule, typeDeclaration.name.fernFilepath),
            partial: false,
            access: "public"
        });

        const properties = this.flattenedProperties.get(typeId) ?? objectTypeDeclaration.properties;
        properties.forEach((property) => {
            class_.addField(
                csharp.field({
                    name: property.name.name.pascalCase.safeName,
                    type: this.referenceGenerator.typeFromTypeReference(this.rootModule, property.valueType),
                    access: "public",
                    get: true,
                    init: true,
                    summary: property.docs
                })
            );
        });

        return class_;
    }

    private _generateSingleUnionType() {
        // Create a base object if there's extended types or properties
        // Add class that extends the type object and adds a field for the discriminant
        // For each primitive put a .value field in the class
        // For each object, create another object that extends the newly created extension class (which would be private)
        //
        // Create a class for each type that extends the base, adds the discriminant and the flattened proeprties of `type`
    }

    private generateUnionClass(
        typeId: TypeId,
        unionTypeDeclaration: UnionTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): csharp.Class {
        // Generate a class that adds the discriminator to the base objects
        // Then leverage the OneOf
        const namespace = csharp.Class.getNamespaceFromFernFilepath(this.rootModule, typeDeclaration.name.fernFilepath);
        const class_ = csharp.class_({
            name: this._getNameFromIrName(typeDeclaration.name.name),
            namespace,
            partial: false,
            access: "public"
        });

        // Generate a base class that will get extended by the member classes
        const baseProperties = this.flattenedProperties.get(typeId) ?? [];
        const baseClass = csharp.class_({});

        unionTypeDeclaration.types
            .map<csharp.Class>((member) => {
                const discriminantFieldJsonPropertyName = unionTypeDeclaration.discriminant.wireValue;
                const discriminantField = csharp.field({
                    name: this._getNameFromIrName(unionTypeDeclaration.discriminant.name),
                    type: csharp.Types.string(),
                    access: "public",
                    get: true,
                    initializer: new CodeBlock({ value: `"${member.discriminantValue.wireValue}"` }),
                    init: false,
                    jsonPropertyName: discriminantFieldJsonPropertyName
                });

                const nestedClass = csharp.class_({
                    name: "TODO: how is this named",
                    namespace,
                    partial: false,
                    access: "public",
                    parentClassReference: baseClass.reference
                });
                nestedClass.addField(discriminantField);

                return member.shape._visit<csharp.Class | undefined>({
                    samePropertiesAsObject: (objectType) => {
                        return;
                    },
                    singleProperty: (property) => {
                        const singlePropertyField = csharp.field({
                            name: this._getNameFromIrName(property.name.name),
                            type: this.referenceGenerator.typeFromTypeReference(this.rootModule, property.type),
                            access: "public",
                            get: true,
                            init: true,
                            jsonPropertyName: property.name.wireValue
                        });
                        nestedClass.addField(singlePropertyField);
                        return nestedClass;
                    },
                    noProperties: () => {
                        return nestedClass;
                    },
                    _other: () => undefined
                });
            })
            .forEach((memberClass) => class_.addNestedClass(memberClass));

        return class_;
    }

    private generateUndiscriminatedUnionClass(typeId: TypeId): undefined {
        // Undiscriminated unions are managed through the use of the OneOf library:
        // OneOf<Type1, Type2, ...>, and so there is no need to generate a class for them,
        // given there are no aliases.
        this.generatorContext.logger.error(
            "Skipping generation of undiscriminated union type, we just annotate unions: " + typeId
        );
        return;
    }

    private generateUnknownClass(shape: Type): undefined {
        this.generatorContext.logger.error("Skipping generation of unknown type: " + shape.type);
        return;
    }

    public generateTypes(): CSharpFile[] {
        this.generatorContext.logger.debug("Generating all types...");
        const typeFiles: CSharpFile[] = [];
        for (const [typeId, typeDeclaration] of this.types.entries()) {
            const filePath = CSharpFile.getFilePathFromFernFilePath(typeDeclaration.name.fernFilepath);
            this.generatorContext.logger.debug(`Generating type: ${typeId}`);
            const generatedClass = typeDeclaration.shape._visit<csharp.Class | undefined>({
                alias: () => this.generateAliasClass(typeId),
                enum: (etd: EnumTypeDeclaration) => this.generateEnumClass(etd, typeDeclaration),
                object: (otd: ObjectTypeDeclaration) => this.generateObjectClass(typeId, otd, typeDeclaration),
                union: (utd: UnionTypeDeclaration) => this.generateUnionClass(typeId, utd, typeDeclaration),
                undiscriminatedUnion: () => this.generateUndiscriminatedUnionClass(typeId),
                _other: () => this.generateUnknownClass(typeDeclaration.shape)
            });

            if (generatedClass != null) {
                typeFiles.push(new CSharpFile({ clazz: generatedClass, directory: filePath }));
            }
        }
        return typeFiles;
    }
}
