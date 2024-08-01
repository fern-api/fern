import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ExampleObjectType, NameAndWireValue, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ExampleGenerator } from "../snippets/ExampleGenerator";
import { getUndiscriminatedUnionSerializerAnnotation } from "../undiscriminated-union/getUndiscriminatedUnionSerializerAnnotation";

export class ObjectGenerator extends FileGenerator<CSharpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly classReference: csharp.ClassReference;
    private readonly exampleGenerator: ExampleGenerator;
    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly objectDeclaration: ObjectTypeDeclaration
    ) {
        super(context);
        this.classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration.name);
        this.exampleGenerator = new ExampleGenerator(context);
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.classReference,
            partial: false,
            access: "public",
            record: true
        });
        const flattenedProperties = [
            ...this.objectDeclaration.properties,
            ...(this.objectDeclaration.extendedProperties ?? [])
        ];
        flattenedProperties.forEach((property) => {
            const annotations: csharp.Annotation[] = [];
            const maybeUndiscriminatedUnion = this.context.getAsUndiscriminatedUnionTypeDeclaration(property.valueType);
            if (maybeUndiscriminatedUnion != null) {
                annotations.push(
                    getUndiscriminatedUnionSerializerAnnotation({
                        context: this.context,
                        undiscriminatedUnionDeclaration: maybeUndiscriminatedUnion.declaration,
                        isList: maybeUndiscriminatedUnion.isList
                    })
                );
            }

            class_.addField(
                csharp.field({
                    name: this.getPropertyName({ className: this.classReference.name, objectProperty: property.name }),
                    type: this.context.csharpTypeMapper.convert({ reference: property.valueType }),
                    access: "public",
                    get: true,
                    set: true,
                    summary: property.docs,
                    jsonPropertyName: property.name.wireValue,
                    annotations,
                    useRequired: true
                })
            );
        });

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getDirectoryForTypeId(this.typeDeclaration.name.typeId)
        });
    }

    public doGenerateSnippet(exampleObject: ExampleObjectType): csharp.CodeBlock {
        const args = exampleObject.properties.map((exampleProperty) => {
            const propertyName = this.getPropertyName({
                className: this.classReference.name,
                objectProperty: exampleProperty.name
            });
            const assignment = this.exampleGenerator.getSnippetForTypeReference(exampleProperty.value);
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

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            RelativeFilePath.of(this.classReference.name + ".cs")
        );
    }
}
