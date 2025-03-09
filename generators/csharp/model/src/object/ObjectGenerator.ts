import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
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
        const class_ = csharp.class_({
            ...this.classReference,
            summary: this.typeDeclaration.docs,
            access: csharp.Access.Public,
            type: csharp.Class.ClassType.Record
        });
        const properties = [...this.objectDeclaration.properties, ...(this.objectDeclaration.extendedProperties ?? [])];
        class_.addFields(generateFields({ properties, className: this.classReference.name, context: this.context }));

        class_.addField(
            csharp.field({
                name: "AdditionalProperties",
                type: this.context.getAdditionalPropertiesType(),
                access: csharp.Access.Public,
                summary: "Additional properties received from the response, if any.",
                set: csharp.Access.Internal,
                get: csharp.Access.Public,
                initializer: csharp.codeblock((writer) =>
                    writer.writeNode(
                        csharp.dictionary({
                            keyType: csharp.Type.string(),
                            valueType: csharp.Type.reference(this.context.getJsonElementClassReference()),
                            values: undefined
                        })
                    )
                ),
                annotations: [this.context.getJsonExtensionDataAttribute()]
            })
        );

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
