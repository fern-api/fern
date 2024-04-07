import { csharp, CSharpFile, Generator } from "@fern-api/csharp-codegen";
import { ObjectProperty, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class ObjectGenerator extends Generator<ModelCustomConfigSchema, ModelGeneratorContext> {
    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly objectDeclaration: ObjectTypeDeclaration
    ) {
        super(context);
    }

    public generate(): CSharpFile {
        const typeId = this.typeDeclaration.name.typeId;
        const classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration.name);
        const class_ = csharp.class_({
            ...classReference,
            partial: false,
            access: "public"
        });

        const properties = this.context.flattenedProperties.get(typeId) ?? this.objectDeclaration.properties;
        properties.forEach((property) => {
            class_.addField(
                csharp.field({
                    name: this.getPropertyName({ className: classReference.name, objectProperty: property }),
                    type: this.context.csharpTypeMapper.convert({ reference: property.valueType }),
                    access: "public",
                    get: true,
                    init: true,
                    summary: property.docs,
                    jsonPropertyName: property.name.wireValue
                })
            );
        });

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getDirectoryForTypeId(this.typeDeclaration.name.typeId)
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
        objectProperty: ObjectProperty;
    }): string {
        const propertyName = this.context.getPascalCaseSafeName(objectProperty.name.name);
        if (propertyName === className) {
            return `${propertyName}_`;
        }
        return propertyName;
    }
}
