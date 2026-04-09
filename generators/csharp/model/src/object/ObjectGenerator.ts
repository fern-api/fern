import { getWireValue } from "@fern-api/base-generator";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

type ExampleObjectType = FernIr.ExampleObjectType;
type NameAndWireValueOrString = FernIr.NameAndWireValueOrString;
type ObjectProperty = FernIr.ObjectProperty;
type ObjectTypeDeclaration = FernIr.ObjectTypeDeclaration;
type TypeDeclaration = FernIr.TypeDeclaration;
type TypeReference = FernIr.TypeReference;

import { generateFields } from "../generateFields.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { ExampleGenerator } from "../snippets/ExampleGenerator.js";

export class ObjectGenerator extends FileGenerator<CSharpFile, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: ast.ClassReference;
    private readonly exampleGenerator: ExampleGenerator;
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly objectDeclaration: ObjectTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration);
        this.exampleGenerator = new ExampleGenerator(context);
    }

    public doGenerate(): CSharpFile {
        const interfaces = [this.System.Text.Json.Serialization.IJsonOnDeserialized];
        if (this.objectDeclaration.extraProperties) {
            interfaces.push(this.System.Text.Json.Serialization.IJsonOnSerializing);
        }

        const class_ = this.csharp.class_({
            reference: this.classReference,
            summary: this.typeDeclaration.docs,
            access: ast.Access.Public,
            type: ast.Class.ClassType.Record,
            interfaceReferences: interfaces,
            annotations: [this.System.Serializable]
        });
        const properties = [...this.objectDeclaration.properties, ...(this.objectDeclaration.extendedProperties ?? [])];
        generateFields(class_, {
            properties,
            className: this.classReference.name,
            context: this.context
        });

        this.addExtensionDataField(class_);
        const additionalProperties = this.addAdditionalPropertiesProperty(class_);
        this.addOnDeserialized(class_, additionalProperties);
        this.addOnSerializing(class_, additionalProperties);
        this.context.getToStringMethod(class_);

        if (this.shouldAddProtobufMappers(this.typeDeclaration)) {
            this.addProtobufMappers({
                class_,
                properties
            });
        }

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getDirectoryForTypeId(this.typeDeclaration.name.typeId),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    private addExtensionDataField(class_: ast.Class): void {
        const hasBoundOrigin = class_.origin != null;
        const fieldType = this.Collection.idictionary(
            this.Primitive.string,
            this.objectDeclaration.extraProperties
                ? this.Primitive.object.asOptional()
                : this.System.Text.Json.JsonElement,
            {
                dontSimplify: true
            }
        );
        const fieldInitializer = this.objectDeclaration.extraProperties
            ? this.System.Collections.Generic.Dictionary(
                  this.Primitive.string,
                  this.Primitive.object.asOptional()
              ).new()
            : this.System.Collections.Generic.Dictionary(
                  this.Primitive.string,
                  this.System.Text.Json.JsonElement
              ).new();
        if (hasBoundOrigin) {
            class_.addField({
                origin: class_.explicit("_extensionData"),
                annotations: [this.System.Text.Json.Serialization.JsonExtensionData],
                access: ast.Access.Private,
                readonly: true,
                type: fieldType,
                initializer: fieldInitializer
            });
        } else {
            class_.addField({
                name: "_extensionData",
                annotations: [this.System.Text.Json.Serialization.JsonExtensionData],
                access: ast.Access.Private,
                readonly: true,
                type: fieldType,
                initializer: fieldInitializer
            });
        }
    }

    private addAdditionalPropertiesProperty(class_: ast.Class) {
        const hasBoundOrigin = class_.origin != null;
        const fieldType = this.objectDeclaration.extraProperties
            ? this.Types.AdditionalProperties()
            : this.Types.ReadOnlyAdditionalProperties();
        const fieldSet = this.objectDeclaration.extraProperties ? true : ast.Access.Private;
        if (hasBoundOrigin) {
            return class_.addField({
                origin: class_.explicit("AdditionalProperties"),
                annotations: [this.System.Text.Json.Serialization.JsonIgnore],
                access: ast.Access.Public,
                type: fieldType,
                get: true,
                set: fieldSet,
                initializer: this.csharp.codeblock("new()")
            });
        } else {
            return class_.addField({
                name: "AdditionalProperties",
                annotations: [this.System.Text.Json.Serialization.JsonIgnore],
                access: ast.Access.Public,
                type: fieldType,
                get: true,
                set: fieldSet,
                initializer: this.csharp.codeblock("new()")
            });
        }
    }

    private addOnSerializing(class_: ast.Class, additionalProperties: ast.Field): void {
        if (this.objectDeclaration.extraProperties) {
            class_.addMethod({
                name: "OnSerializing",
                interfaceReference: this.System.Text.Json.Serialization.IJsonOnSerializing,
                parameters: [],
                bodyType: ast.Method.BodyType.Expression,
                body: this.csharp.codeblock(`${additionalProperties.name}.CopyToExtensionData(_extensionData)`)
            });
        }
    }

    private addOnDeserialized(class_: ast.Class, additionalProperties: ast.Field): void {
        class_.addMethod({
            name: "OnDeserialized",
            interfaceReference: this.System.Text.Json.Serialization.IJsonOnDeserialized,
            parameters: [],
            bodyType: ast.Method.BodyType.Expression,
            body: this.csharp.codeblock(`${additionalProperties.name}.CopyFromExtensionData(_extensionData)`)
        });
    }

    public doGenerateSnippet({
        exampleObject,
        parseDatetimes
    }: {
        exampleObject: ExampleObjectType;
        parseDatetimes: boolean;
    }): ast.CodeBlock {
        // When generateLiterals is enabled, collect wire values of literal properties so we
        // can skip them in the object initializer. Their default `= new()` already sets the
        // correct value and assigning a plain string would cause a CS0029 compilation error.
        const literalPropertyWireValues = new Set<string>();
        if (this.generation.settings.generateLiterals) {
            const allProps = [
                ...this.objectDeclaration.properties,
                ...(this.objectDeclaration.extendedProperties ?? [])
            ];
            for (const prop of allProps) {
                if (this.context.isLiteralValue(prop.valueType)) {
                    literalPropertyWireValues.add(getWireValue(prop.name));
                }
            }
        }

        const args = exampleObject.properties
            .filter((exampleProperty) => !literalPropertyWireValues.has(getWireValue(exampleProperty.name)))
            .map((exampleProperty) => {
                const propertyName = this.getPropertyName({
                    className: this.classReference.name,
                    objectProperty: exampleProperty.name
                });
                const assignment = this.exampleGenerator.getSnippetForTypeReference({
                    exampleTypeReference: exampleProperty.value,
                    parseDatetimes
                });
                // todo: considering filtering out "assignments" are are actually just null so that null properties
                // are completely excluded from object initializers
                return { name: propertyName, assignment };
            });

        // Include default values for required properties missing from the example
        // so the generated object initializer compiles without CS9035 errors.
        const providedWireValues = new Set(exampleObject.properties.map((p) => getWireValue(p.name)));
        const allProperties = [
            ...this.objectDeclaration.properties,
            ...(this.objectDeclaration.extendedProperties ?? [])
        ];
        for (const property of allProperties) {
            if (providedWireValues.has(getWireValue(property.name))) {
                continue;
            }
            // Skip literal properties when generateLiterals is enabled; they have correct defaults.
            if (literalPropertyWireValues.has(getWireValue(property.name))) {
                continue;
            }
            if (this.isRequiredProperty(property.valueType)) {
                const propertyName = this.getPropertyName({
                    className: this.classReference.name,
                    objectProperty: property.name
                });
                const defaultValue = this.getDefaultSnippetForType(property.valueType);
                if (defaultValue != null) {
                    args.push({ name: propertyName, assignment: defaultValue });
                }
            }
        }

        if (
            this.objectDeclaration.extraProperties &&
            exampleObject.extraProperties != null &&
            exampleObject.extraProperties.length > 0
        ) {
            const extraPropertiesSnippet = this.generateExtraPropertiesSnippet({
                extraProperties: exampleObject.extraProperties,
                parseDatetimes
            });
            args.push({
                name: "AdditionalProperties",
                assignment: extraPropertiesSnippet
            });
        }

        const instantiateClass = this.csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: args
        });
        return this.csharp.codeblock((writer) => writer.writeNode(instantiateClass));
    }

    private generateExtraPropertiesSnippet({
        extraProperties,
        parseDatetimes
    }: {
        extraProperties: FernIr.ExampleExtraObjectProperty[];
        parseDatetimes: boolean;
    }): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.writeLine("new AdditionalProperties");
            writer.pushScope();
            for (const extraProperty of extraProperties) {
                const valueSnippet = this.exampleGenerator.getSnippetForTypeReference({
                    exampleTypeReference: extraProperty.value,
                    parseDatetimes
                });
                writer.write(`["${getWireValue(extraProperty.name)}"] = `);
                writer.writeNode(valueSnippet);
                writer.writeLine(",");
            }
            writer.popScope();
        });
    }

    private addProtobufMappers({ class_, properties }: { class_: ast.Class; properties: ObjectProperty[] }): void {
        const protobufClassReference = this.context.protobufResolver.getProtobufClassReference(
            this.typeDeclaration.name.typeId
        );
        const protoProperties = properties.map((property) => {
            return {
                propertyName: this.getPropertyName({
                    className: this.classReference.name,
                    objectProperty: property.name
                }),
                typeReference: property.valueType
            };
        });

        this.context.csharpProtobufTypeMapper.toProtoMethod(class_, {
            classReference: this.classReference,
            protobufClassReference,
            properties: protoProperties
        });

        this.context.csharpProtobufTypeMapper.fromProtoMethod(class_, {
            classReference: this.classReference,
            protobufClassReference,
            properties: protoProperties
        });
    }

    /**
     * Returns true if a property's type will be marked as `required` in C#.
     * A property is required when it is not optional, not nullable, and not a collection.
     */
    private isRequiredProperty(typeReference: TypeReference): boolean {
        if (this.context.isOptional(typeReference) || this.context.isNullable(typeReference)) {
            return false;
        }
        if (typeReference.type === "container") {
            const ct = typeReference.container.type;
            if (ct === "list" || ct === "set" || ct === "map") {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns a CodeBlock with the C# default value for a type reference.
     * Used when a required property is missing from an example.
     */
    private getDefaultSnippetForType(
        typeReference: TypeReference,
        visitedTypeIds?: Set<string>
    ): ast.CodeBlock | undefined {
        switch (typeReference.type) {
            case "primitive":
                return this.context.getDefaultValueForPrimitive({ primitive: typeReference.primitive });
            case "named": {
                const typeDeclaration = this.context.model.dereferenceType(typeReference.typeId).typeDeclaration;
                if (typeDeclaration.shape.type === "alias") {
                    return this.getDefaultSnippetForType(typeDeclaration.shape.aliasOf, visitedTypeIds);
                }
                if (typeDeclaration.shape.type === "enum" && typeDeclaration.shape.values.length > 0) {
                    const firstEnumValue = typeDeclaration.shape.values[0];
                    if (firstEnumValue != null) {
                        const classRef = this.context.csharpTypeMapper.convertToClassReference(typeDeclaration);
                        const firstValue = this.case.pascalSafe(firstEnumValue.name);
                        return this.csharp.codeblock(`${classRef.name}.${firstValue}`);
                    }
                }
                if (typeDeclaration.shape.type === "object") {
                    return this.getDefaultSnippetForObject(typeDeclaration, typeDeclaration.shape, visitedTypeIds);
                }
                return undefined;
            }
            default:
                return undefined;
        }
    }

    /**
     * Returns a CodeBlock that constructs a default object initializer for a required nested object.
     * Recursively fills in required properties with defaults.
     */
    private getDefaultSnippetForObject(
        typeDeclaration: TypeDeclaration,
        objectShape: ObjectTypeDeclaration,
        visitedTypeIds?: Set<string>
    ): ast.CodeBlock | undefined {
        const visited = visitedTypeIds ?? new Set<string>();
        const typeId = typeDeclaration.name.typeId;
        if (visited.has(typeId)) {
            return undefined;
        }
        visited.add(typeId);

        const classRef = this.context.csharpTypeMapper.convertToClassReference(typeDeclaration);
        const allProperties = [...objectShape.properties, ...(objectShape.extendedProperties ?? [])];
        const args: { name: string; assignment: ast.CodeBlock }[] = [];
        for (const property of allProperties) {
            if (this.isRequiredProperty(property.valueType)) {
                const propertyName = this.getPropertyName({
                    className: classRef.name,
                    objectProperty: property.name
                });
                const defaultValue = this.getDefaultSnippetForType(property.valueType, visited);
                if (defaultValue != null) {
                    args.push({ name: propertyName, assignment: defaultValue });
                }
            }
        }

        visited.delete(typeId);

        const instantiateClass = this.csharp.instantiateClass({
            classReference: classRef,
            arguments_: args
        });
        return this.csharp.codeblock((writer) => writer.writeNode(instantiateClass));
    }

    /**
     * Class Names and Property Names cannot overlap in C# otherwise there are compilation errors.
     */
    private getPropertyName({
        className,
        objectProperty
    }: {
        className: string;
        objectProperty: NameAndWireValueOrString;
    }): string {
        const propertyName = this.case.pascalSafe(objectProperty);
        if (propertyName === className) {
            return `${propertyName}_`;
        }
        return propertyName;
    }

    private shouldAddProtobufMappers(typeDeclaration: TypeDeclaration): boolean {
        return typeDeclaration.encoding?.proto != null;
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.sourceFiles, RelativeFilePath.of(`${this.classReference.name}.cs`));
    }
}
