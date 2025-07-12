import { RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, RustFile } from "@fern-api/rust-base";
import { SELF, rust } from "@fern-api/rust-codegen";

import { Name, ObjectProperty, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class ObjectGenerator extends FileGenerator<RustFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: rust.StructReference;
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly objectDeclaration: ObjectTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.rustTypeMapper.convertToClassReference(this.typeDeclaration.name);
    }

    public doGenerate(): RustFile {
        const clazz = rust.dataClass({
            ...this.classReference,
            docs: this.typeDeclaration.docs,
            parentClassReference: this.context.getJsonSerializableTypeClassReference(),
            traits: this.objectDeclaration.extends.map((declaredTypeName) =>
                this.context.rustTypeMapper.convertToTraitClassReference(declaredTypeName)
            )
        });
        const { includeGetter, includeSetter } = {
            includeGetter: this.context.shouldGenerateGetterMethods(),
            includeSetter: this.context.shouldGenerateSetterMethods()
        };
        for (const property of this.objectDeclaration.extendedProperties ?? []) {
            clazz.addField(this.toField({ property, inherited: true }));
        }
        for (const property of this.objectDeclaration.properties) {
            const field = this.toField({ property });
            if (includeGetter) {
                clazz.addMethod(this.context.getGetterMethod({ name: property.name.name, field }));
            }
            if (includeSetter) {
                clazz.addMethod(this.context.getSetterMethod({ name: property.name.name, field }));
            }
            clazz.addField(field);
        }
        clazz.addMethod(this.context.getToStringMethod());
        return new RustFile({
            struct: clazz,
            rootNamespace: this.context.getRootNamespace(),
            directory: this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory,
            customConfig: this.context.customConfig
        });
    }

    private toField({ property, inherited }: { property: ObjectProperty; inherited?: boolean }): rust.Field {
        const convertedType = this.context.rustTypeMapper.convert({ reference: property.valueType });
        return rust.field({
            type: convertedType,
            name: this.context.getPropertyName(property.name.name),
            access: this.context.getPropertyAccess(),
            docs: property.docs,
            attributes: this.context.rustAttributeMapper.convert({
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
