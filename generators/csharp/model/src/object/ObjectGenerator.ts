import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import {
    ExampleObjectType,
    NameAndWireValue,
    ObjectProperty,
    ObjectTypeDeclaration,
    TypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { generateFields } from "../generateFields";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ExampleGenerator } from "../snippets/ExampleGenerator";

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
        const interfaces = [];
        if (this.settings.generateNewAdditionalProperties) {
            interfaces.push(this.System.Text.Json.Serialization.IJsonOnDeserialized);
            if (this.objectDeclaration.extraProperties) {
                interfaces.push(this.System.Text.Json.Serialization.IJsonOnSerializing);
            }
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
        generateFields(class_, { properties, className: this.classReference.name, context: this.context });

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
        if (this.settings.generateNewAdditionalProperties) {
            class_.addField({
                origin: class_.explicit("_extensionData"),
                annotations: [this.System.Text.Json.Serialization.JsonExtensionData],
                access: ast.Access.Private,
                readonly: true,
                type: this.Collection.idictionary(
                    this.Primitive.string,
                    this.objectDeclaration.extraProperties
                        ? this.Primitive.object.toOptionalIfNotAlready()
                        : this.System.Text.Json.JsonElement,
                    {
                        dontSimplify: true
                    }
                ),
                initializer: this.objectDeclaration.extraProperties
                    ? this.System.Collections.Generic.Dictionary(
                          this.Primitive.string,
                          this.Primitive.object.toOptionalIfNotAlready()
                      ).new()
                    : this.System.Collections.Generic.Dictionary(
                          this.Primitive.string,
                          this.System.Text.Json.JsonElement
                      ).new()
            });
        }
    }

    private addAdditionalPropertiesProperty(class_: ast.Class) {
        return this.settings.generateNewAdditionalProperties
            ? class_.addField({
                  origin: class_.explicit("AdditionalProperties"),
                  annotations: [this.System.Text.Json.Serialization.JsonIgnore],
                  access: ast.Access.Public,
                  type: this.objectDeclaration.extraProperties
                      ? this.Types.AdditionalProperties()
                      : this.Types.ReadOnlyAdditionalProperties(),

                  get: true,
                  set: this.objectDeclaration.extraProperties ? true : ast.Access.Private,
                  initializer: this.csharp.codeblock("new()")
              })
            : class_.addField({
                  origin: class_.explicit("AdditionalProperties"),
                  doc: {
                      summary: "Additional properties received from the response, if any.",
                      remarks: "[EXPERIMENTAL] This API is experimental and may change in future releases."
                  },
                  annotations: [this.System.Text.Json.Serialization.JsonExtensionData],
                  access: ast.Access.Public,
                  type: this.Collection.idictionary(this.Primitive.string, this.System.Text.Json.JsonElement),
                  set: ast.Access.Internal,
                  get: ast.Access.Public,
                  initializer: this.System.Collections.Generic.Dictionary(
                      this.Primitive.string,
                      this.System.Text.Json.JsonElement
                  ).new()
              });
    }

    private addOnSerializing(class_: ast.Class, additionalProperties: ast.Field): void {
        if (this.settings.generateNewAdditionalProperties) {
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
    }

    private addOnDeserialized(class_: ast.Class, additionalProperties: ast.Field): void {
        if (this.settings.generateNewAdditionalProperties) {
            class_.addMethod({
                name: "OnDeserialized",
                interfaceReference: this.System.Text.Json.Serialization.IJsonOnDeserialized,
                parameters: [],
                bodyType: ast.Method.BodyType.Expression,
                body: this.csharp.codeblock(`${additionalProperties.name}.CopyFromExtensionData(_extensionData)`)
            });
        }
    }

    public doGenerateSnippet({
        exampleObject,
        parseDatetimes
    }: {
        exampleObject: ExampleObjectType;
        parseDatetimes: boolean;
    }): ast.CodeBlock {
        const args = exampleObject.properties.map((exampleProperty) => {
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
        const instantiateClass = this.csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: args
        });
        return this.csharp.codeblock((writer) => writer.writeNode(instantiateClass));
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
     * Class Names and Property Names cannot overlap in C# otherwise there are compilation errors.
     */
    private getPropertyName({
        className,
        objectProperty
    }: {
        className: string;
        objectProperty: NameAndWireValue;
    }): string {
        const propertyName = objectProperty.name.pascalCase.safeName;
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
