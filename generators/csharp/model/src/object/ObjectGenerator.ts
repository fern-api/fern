import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import {
    ExampleObjectType,
    NameAndWireValue,
    ObjectProperty,
    ObjectTypeDeclaration,
    TypeDeclaration
} from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { generateFields } from "../generateFields";
import { ExampleGenerator } from "../snippets/ExampleGenerator";

export class ObjectGenerator extends FileGenerator<CSharpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: csharp.ClassReference;
    private readonly exampleGenerator: ExampleGenerator;
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly objectDeclaration: ObjectTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration.name);
        this.exampleGenerator = new ExampleGenerator(context);
    }

    public doGenerate(): CSharpFile {
        const interfaces = [];
        if (this.context.generateNewAdditionalProperties()) {
            interfaces.push(this.context.getIJsonOnDeserializedInterfaceReference());
            if (this.objectDeclaration.extraProperties) {
                interfaces.push(this.context.getIJsonOnSerializingInterfaceReference());
            }
        }

        const class_ = csharp.class_({
            ...this.classReference,
            summary: this.typeDeclaration.docs,
            access: csharp.Access.Public,
            type: csharp.Class.ClassType.Record,
            interfaceReferences: interfaces,
            annotations: [this.context.getSerializableAttribute()]
        });
        const properties = [...this.objectDeclaration.properties, ...(this.objectDeclaration.extendedProperties ?? [])];
        class_.addFields(generateFields({ properties, className: this.classReference.name, context: this.context }));

        this.addExtensionDataField(class_);
        this.addAdditionalPropertiesProperty(class_);
        this.addOnDeserialized(class_);
        this.addOnSerializing(class_);

        class_.addMethod(this.context.getToStringMethod());

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
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private addExtensionDataField(class_: csharp.Class): void {
        if (this.context.generateNewAdditionalProperties()) {
            class_.addField(
                csharp.field({
                    annotations: [this.context.getJsonExtensionDataAttribute()],
                    access: csharp.Access.Private,
                    readonly: true,
                    type: csharp.Type.idictionary(
                        csharp.Type.string(),
                        this.objectDeclaration.extraProperties
                            ? csharp.Type.object().toOptionalIfNotAlready()
                            : this.context.getJsonElementType(),
                        {
                            dontSimplify: true
                        }
                    ),
                    name: "_extensionData",
                    initializer: this.objectDeclaration.extraProperties
                        ? csharp.codeblock("new Dictionary<string, object?>()")
                        : csharp.codeblock("new Dictionary<string, JsonElement>()")
                })
            );
        }
    }

    private addAdditionalPropertiesProperty(class_: csharp.Class): void {
        if (this.context.generateNewAdditionalProperties()) {
            class_.addField(
                csharp.field({
                    annotations: [this.context.getJsonIgnoreAnnotation()],
                    access: csharp.Access.Public,
                    type: this.objectDeclaration.extraProperties
                        ? this.context.getAdditionalPropertiesType()
                        : this.context.getReadOnlyAdditionalPropertiesType(),
                    name: "AdditionalProperties",
                    get: true,
                    set: this.objectDeclaration.extraProperties ? true : csharp.Access.Private,
                    initializer: csharp.codeblock("new()")
                })
            );
        } else {
            class_.addField(
                csharp.field({
                    doc: {
                        summary: "Additional properties received from the response, if any.",
                        remarks: "[EXPERIMENTAL] This API is experimental and may change in future releases."
                    },
                    annotations: [this.context.getJsonExtensionDataAttribute()],
                    access: csharp.Access.Public,
                    type: csharp.Type.idictionary(csharp.Type.string(), this.context.getJsonElementType()),
                    name: "AdditionalProperties",
                    set: csharp.Access.Internal,
                    get: csharp.Access.Public,
                    initializer: csharp.codeblock("new Dictionary<string, JsonElement>()")
                })
            );
        }
    }

    private addOnSerializing(class_: csharp.Class): void {
        if (this.context.generateNewAdditionalProperties()) {
            if (this.objectDeclaration.extraProperties) {
                class_.addMethod(
                    csharp.method({
                        interfaceReference: this.context.getIJsonOnSerializingInterfaceReference(),
                        name: "OnSerializing",
                        parameters: [],
                        bodyType: csharp.Method.BodyType.Expression,
                        body: csharp.codeblock("AdditionalProperties.CopyToExtensionData(_extensionData)")
                    })
                );
            }
        }
    }

    private addOnDeserialized(class_: csharp.Class): void {
        if (this.context.generateNewAdditionalProperties()) {
            class_.addMethod(
                csharp.method({
                    interfaceReference: this.context.getIJsonOnDeserializedInterfaceReference(),
                    name: "OnDeserialized",
                    parameters: [],
                    bodyType: csharp.Method.BodyType.Expression,
                    body: csharp.codeblock("AdditionalProperties.CopyFromExtensionData(_extensionData)")
                })
            );
        }
    }

    public doGenerateSnippet({
        exampleObject,
        parseDatetimes
    }: {
        exampleObject: ExampleObjectType;
        parseDatetimes: boolean;
    }): csharp.CodeBlock {
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
        const instantiateClass = csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: args
        });
        return csharp.codeblock((writer) => writer.writeNode(instantiateClass));
    }

    private addProtobufMappers({ class_, properties }: { class_: csharp.Class; properties: ObjectProperty[] }): void {
        const protobufClassReference = this.context.protobufResolver.getProtobufClassReferenceOrThrow(
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
        class_.addMethod(
            this.context.csharpProtobufTypeMapper.toProtoMethod({
                classReference: this.classReference,
                protobufClassReference,
                properties: protoProperties
            })
        );
        class_.addMethod(
            this.context.csharpProtobufTypeMapper.fromProtoMethod({
                classReference: this.classReference,
                protobufClassReference,
                properties: protoProperties
            })
        );
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
        const propertyName = this.context.getPascalCaseSafeName(objectProperty.name);
        if (propertyName === className) {
            return `${propertyName}_`;
        }
        return propertyName;
    }

    private shouldAddProtobufMappers(typeDeclaration: TypeDeclaration): boolean {
        return typeDeclaration.encoding?.proto != null;
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            RelativeFilePath.of(this.classReference.name + ".cs")
        );
    }
}
