import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { PhpFile } from "@fern-api/php-codegen";
import { FileGenerator } from "@fern-api/php-codegen";
import { php } from "@fern-api/php-codegen";
import { ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class ObjectGenerator extends FileGenerator<PhpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: php.ClassReference;
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly objectDeclaration: ObjectTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.phpTypeMapper.convertToClassReference(this.typeDeclaration.name);
    }

    public doGenerate(): PhpFile {
        const clazz = php.class_({
            ...this.classReference,
            docs: this.typeDeclaration.docs,
            parentClassReference: this.context.getSerializableTypeClassReference()
        });

        // TODO: handle extended properties
        const properties = this.objectDeclaration.properties.map((property) => ({
            property,
            type: this.context.phpTypeMapper.convert({ reference: property.valueType }),
            name: this.context.getPropertyName(property.name.name),
            docs: property.docs
        }));
        const requiredProperties = properties.filter(({ type }) => type.internalType.type !== "optional");
        const optionalProperties = properties.filter(({ type }) => type.internalType.type === "optional");
        const orderedProperties = [...requiredProperties, ...optionalProperties];
        orderedProperties.forEach((property) => {
            clazz.addField(
                php.field({
                    ...property,
                    access: "public",
                    docs: property.docs,
                    attributes: this.context.phpAttributeMapper.convert(property)
                })
            );
        });

        const parameters = orderedProperties.map((property) => php.parameter(property));
        clazz.addConstructor({
            parameters,
            body: php.codeblock((writer) => {
                orderedProperties.forEach(({ name }) => {
                    writer.writeTextStatement(`$this->${name} = $${name}`);
                });
            })
        });

        return new PhpFile({
            clazz,
            rootNamespace: this.context.getRootNamespace(),
            directory: this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory,
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory;
    }
}
