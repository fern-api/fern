import { csharp, CSharpFile, PrebuiltUtilities } from "@fern-api/csharp-codegen";
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
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { getNameFromIrName } from "./GeneratorUtilities";
import { ReferenceGenerator } from "./ReferenceGenerator";

export class ModelGenerator {
    private rootModule: string;

    private types: Map<TypeId, TypeDeclaration>;
    private flattenedProperties: Map<TypeId, ObjectProperty[]>;
    private generatorContext: GeneratorContext;
    private referenceGenerator: ReferenceGenerator;
    private prebuiltUtilities: PrebuiltUtilities;

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

        this.prebuiltUtilities = new PrebuiltUtilities(this.rootModule);
        this.referenceGenerator = new ReferenceGenerator(this.types, this.prebuiltUtilities);
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

    private generateEnumClass(enumTypeDeclaration: EnumTypeDeclaration, typeDeclaration: TypeDeclaration): csharp.Enum {
        const enum_ = csharp.enum_({
            name: getNameFromIrName(typeDeclaration.name.name),
            namespace: csharp.Class.getNamespaceFromFernFilepath(this.rootModule, typeDeclaration.name.fernFilepath),
            access: "public",
            annotations: [this.prebuiltUtilities.enumConverterAnnotation()]
        });

        enumTypeDeclaration.values.forEach((member) =>
            enum_.addMember({ name: member.name.name.pascalCase.safeName, value: member.name.wireValue })
        );

        return enum_;
    }

    private generateObjectClass(
        typeId: TypeId,
        objectTypeDeclaration: ObjectTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): csharp.Class {
        const class_ = csharp.class_({
            name: getNameFromIrName(typeDeclaration.name.name),
            namespace: csharp.Class.getNamespaceFromFernFilepath(this.rootModule, typeDeclaration.name.fernFilepath),
            partial: false,
            access: "public"
        });

        const properties = this.flattenedProperties.get(typeId) ?? objectTypeDeclaration.properties;
        properties.forEach((property) => {
            const maybeAnnotation = this.referenceGenerator.annotations.get(property.valueType);
            class_.addField(
                csharp.field({
                    name: property.name.name.pascalCase.safeName,
                    type: this.referenceGenerator.typeFromTypeReference(this.rootModule, property.valueType),
                    access: "public",
                    get: true,
                    init: true,
                    summary: property.docs,
                    jsonPropertyName: property.name.wireValue,
                    annotations: maybeAnnotation ? [maybeAnnotation] : undefined
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
        // For discriminated unions we:
        // 1. Generate a wrapper class that shares the unions name
        // 2. Generate a base interface that contains the properties of the `extends` classes as well as the base properties
        // 3. Generate sub-classes for each member of the union
        // 3a. Each sub-class extends the base class and includes it's discriminant
        // 3b. If a sub-class is also an existing object (`samePropertiesAsObject`), the sub-class will extend that object
        const namespace = csharp.Class.getNamespaceFromFernFilepath(this.rootModule, typeDeclaration.name.fernFilepath);
        const class_ = csharp.class_({
            name: getNameFromIrName(typeDeclaration.name.name),
            namespace,
            partial: false,
            access: "public"
        });

        // Generate a base interface that will get extended by the member classes
        const baseProperties = this.flattenedProperties.get(typeId) ?? [];
        const baseInterface = csharp.interface_({
            name: "IBase",
            namespace,
            access: "private",
            partial: false
        });
        let interfaceReferences: csharp.ClassReference[] | undefined = undefined;
        if (baseProperties.length > 0) {
            baseProperties.forEach((property) => {
                const maybeAnnotation = this.referenceGenerator.annotations.get(property.valueType);
                baseInterface.addField(
                    csharp.field({
                        name: getNameFromIrName(property.name.name),
                        type: this.referenceGenerator.typeFromTypeReference(this.rootModule, property.valueType),
                        access: "public",
                        get: true,
                        init: true,
                        jsonPropertyName: property.name.wireValue,
                        annotations: maybeAnnotation ? [maybeAnnotation] : undefined
                    })
                );
            });
            class_.addNestedInterface(baseInterface);
            interfaceReferences = [baseInterface.reference];
        }

        unionTypeDeclaration.types
            .map<csharp.Class | undefined>((member) => {
                const discriminantFieldJsonPropertyName = unionTypeDeclaration.discriminant.wireValue;
                const discriminantField = csharp.field({
                    name: getNameFromIrName(unionTypeDeclaration.discriminant.name),
                    type: csharp.Types.string(),
                    access: "public",
                    get: true,
                    initializer: new csharp.CodeBlock({ value: `"${member.discriminantValue.wireValue}"` }),
                    init: false,
                    jsonPropertyName: discriminantFieldJsonPropertyName
                });

                return member.shape._visit<csharp.Class | undefined>({
                    samePropertiesAsObject: (objectType) => {
                        const parentClassReference = this.referenceGenerator.fromDeclaredTypeName(
                            this.rootModule,
                            objectType
                        );
                        if (parentClassReference == null || parentClassReference.internalType.type !== "reference") {
                            this.generatorContext.logger.error(
                                "Could not find reference for object " +
                                    objectType.typeId +
                                    " when generating union: " +
                                    typeId
                            );
                            return;
                        }
                        const nestedClass = csharp.class_({
                            name: `_${getNameFromIrName(objectType.name)}`,
                            namespace,
                            partial: false,
                            access: "public",
                            interfaceReferences,
                            parentClassReference: parentClassReference.internalType.value,
                            isNestedClass: true
                        });
                        nestedClass.addField(discriminantField);

                        return nestedClass;
                    },
                    singleProperty: (property) => {
                        const nestedClass = csharp.class_({
                            name: `_${getNameFromIrName(property.name.name)}`,
                            namespace,
                            partial: false,
                            access: "public",
                            interfaceReferences,
                            isNestedClass: true
                        });
                        nestedClass.addField(discriminantField);

                        const maybeAnnotation = this.referenceGenerator.annotations.get(property.type);
                        const singlePropertyField = csharp.field({
                            name: getNameFromIrName(property.name.name),
                            type: this.referenceGenerator.typeFromTypeReference(this.rootModule, property.type),
                            access: "public",
                            get: true,
                            init: true,
                            jsonPropertyName: property.name.wireValue,
                            annotations: maybeAnnotation ? [maybeAnnotation] : undefined
                        });
                        nestedClass.addField(singlePropertyField);
                        return nestedClass;
                    },
                    noProperties: () => {
                        const nestedClass = csharp.class_({
                            name: `_${getNameFromIrName(member.discriminantValue.name)}`,
                            namespace,
                            partial: false,
                            access: "public",
                            interfaceReferences,
                            isNestedClass: true
                        });
                        nestedClass.addField(discriminantField);

                        return nestedClass;
                    },
                    _other: () => undefined
                });
            })
            .filter((c): c is csharp.Class => c !== undefined)
            .forEach((memberClass) => class_.addNestedClass(memberClass));

        return class_;
    }

    private generateUndiscriminatedUnionClass(typeId: TypeId): undefined {
        // Undiscriminated unions are managed through the use of the OneOf library:
        // OneOf<Type1, Type2, ...>, and so there is no need to generate a class for them,
        // given there are no aliases.
        this.generatorContext.logger.debug(
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
            const generatedClass = typeDeclaration.shape._visit<csharp.Class | csharp.Enum | undefined>({
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
