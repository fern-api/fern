import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { PhpFile } from "@fern-api/php-codegen";
import { FileGenerator } from "@fern-api/php-codegen";
import { php } from "@fern-api/php-codegen";

import { ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class TraitGenerator extends FileGenerator<PhpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: php.ClassReference;
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly objectDeclaration: ObjectTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.phpTypeMapper.convertToTraitClassReference(this.typeDeclaration.name);
    }

    public doGenerate(): PhpFile {
        const clazz = php.trait({
            ...this.classReference,
            docs: this.typeDeclaration.docs,
            traits: this.objectDeclaration.extends.map((declaredTypeName) =>
                this.context.phpTypeMapper.convertToTraitClassReference(declaredTypeName)
            )
        });

        for (const property of this.objectDeclaration.properties) {
            const convertedType = this.context.phpTypeMapper.convert({ reference: property.valueType });
            clazz.addField(
                php.field({
                    type: convertedType,
                    name: this.context.getPropertyName(property.name.name),
                    access: "public",
                    docs: property.docs,
                    attributes: this.context.phpAttributeMapper.convert({
                        type: convertedType,
                        property
                    })
                })
            );
        }

        return new PhpFile({
            clazz,
            rootNamespace: this.context.getRootNamespace(),
            directory: this.context.getTraitLocationForTypeId(this.typeDeclaration.name.typeId).directory,
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getTraitLocationForTypeId(this.typeDeclaration.name.typeId).directory;
    }
}
