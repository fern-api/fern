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
            partial: false,
            access: csharp.Access.Public,
            type: csharp.Class.ClassType.Record
        });
        const flattenedProperties = [
            ...this.objectDeclaration.properties,
            ...(this.objectDeclaration.extendedProperties ?? [])
        ];
        flattenedProperties.forEach((property) => {
            class_.addField(
                csharp.field({
                    name: this.getPropertyName({ className: this.classReference.name, objectProperty: property.name }),
                    type: this.context.csharpTypeMapper.convert({ reference: property.valueType }),
                    access: csharp.Access.Public,
                    get: true,
                    set: true,
                    summary: property.docs,
                    jsonPropertyName: property.name.wireValue,
                    useRequired: true
                })
            );
        });

        class_.addMethod(this.context.getToStringMethod());

        if (this.shouldAddProtobufMappers(this.typeDeclaration)) {
            this.addProtobufMappers({
                class_,
                flattenedProperties
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

    private addProtobufMappers({
        class_,
        flattenedProperties
    }: {
        class_: csharp.Class;
        flattenedProperties: ObjectProperty[];
    }): void {
        const protobufClassReference = this.context.protobufResolver.getProtobufClassReferenceOrThrow(
            this.typeDeclaration.name.typeId
        );
        const properties = flattenedProperties.map((property) => {
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
                properties
            })
        );
        class_.addMethod(
            this.context.csharpProtobufTypeMapper.fromProtoMethod({
                classReference: this.classReference,
                protobufClassReference,
                properties
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
