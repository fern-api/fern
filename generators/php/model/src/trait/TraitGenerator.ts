import { RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { ModelCustomConfigSchema } from "../ModelCustomConfig.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export class TraitGenerator extends FileGenerator<PhpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: FernIr.TypeDeclaration;
    private readonly classReference: php.ClassReference;
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: FernIr.TypeDeclaration,
        private readonly objectDeclaration: FernIr.ObjectTypeDeclaration
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
        return this.context.getTraitLocationForTypeId(this.typeDeclaration.name.typeId).directory;
    }

    protected getLogLabel(): string {
        const dir = this.context.getTraitLocationForTypeId(this.typeDeclaration.name.typeId).directory;
        return dir ? `${dir}/${this.classReference.name}` : this.classReference.name;
    }
}
