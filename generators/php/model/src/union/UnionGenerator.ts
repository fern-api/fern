import { RelativeFilePath } from "@fern-api/fs-utils";
import { PhpFile } from "@fern-api/php-codegen";
import { FileGenerator } from "@fern-api/php-codegen";
import { php } from "@fern-api/php-codegen";

import { ObjectProperty, TypeDeclaration, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class UnionGenerator extends FileGenerator<PhpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: php.ClassReference;
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly unionTypeDeclaration: UnionTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.phpTypeMapper.convertToClassReference(this.typeDeclaration.name);
    }

    public doGenerate(): PhpFile {
        const clazz = php.dataClass({
            ...this.classReference,
            docs: this.typeDeclaration.docs,
            parentClassReference: this.context.getJsonSerializableTypeClassReference()
        });

        for (const property of this.unionTypeDeclaration.baseProperties) {
            clazz.addField(this.toField({ property }));
        }

        clazz.addMethod(this.context.getToStringMethod());
        return new PhpFile({
            clazz,
            rootNamespace: this.context.getRootNamespace(),
            directory: this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory,
            customConfig: this.context.customConfig
        });
    }

    private toField({ property, inherited }: { property: ObjectProperty; inherited?: boolean }): php.Field {
        const convertedType = this.context.phpTypeMapper.convert({ reference: property.valueType });
        return php.field({
            type: convertedType,
            name: this.context.getPropertyName(property.name.name),
            access: "public",
            docs: property.docs,
            attributes: this.context.phpAttributeMapper.convert({
                type: convertedType,
                property
            }),
            inherited
        });
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory;
    }
}
