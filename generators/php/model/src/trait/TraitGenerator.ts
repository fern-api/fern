import { RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
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
        const { includeGetter, includeSetter } = {
            includeGetter: this.context.shouldGenerateGetterMethods(),
            includeSetter: this.context.shouldGenerateSetterMethods()
        };
        for (const property of this.objectDeclaration.properties) {
            const convertedType = this.context.phpTypeMapper.convert({ reference: property.valueType });
            const field = php.field({
                type: convertedType,
                name: this.context.getPropertyName(property.name.name),
                access: this.context.getPropertyAccess(),
                docs: property.docs,
                attributes: this.context.phpAttributeMapper.convert({
                    type: convertedType,
                    property
                })
            });
            if (includeGetter) {
                clazz.addMethod(this.context.getGetterMethod({ name: property.name.name, field }));
            }
            if (includeSetter) {
                clazz.addMethod(this.context.getSetterMethod({ name: property.name.name, field }));
            }
            clazz.addField(field);
        }
        return new PhpFile({
            clazz,
            rootNamespace: this.context.getRootNamespace(),
            directory: this.context.getTraitLocationForTypeId(this.typeDeclaration.name.typeId).directory,
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        const location = this.context.getTraitLocationForTypeId(this.typeDeclaration.name.typeId);
        return RelativeFilePath.of(`${location.directory}/${this.classReference.name}`);
    }
}
