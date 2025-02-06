import { RelativeFilePath } from "@fern-api/fs-utils";
import { PhpFile } from "@fern-api/php-codegen";
import { FileGenerator } from "@fern-api/php-codegen";
import { php } from "@fern-api/php-codegen";

import {
    DeclaredTypeName,
    ObjectProperty,
    SingleUnionType,
    SingleUnionTypeProperty,
    TypeDeclaration,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";

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

        const typeField = this.getTypeField();
        clazz.addField(typeField);

        const valueField = this.getValueField();
        clazz.addField(valueField);

        for (const type of this.unionTypeDeclaration.types) {
            const method = this.asCastMethod(type);
            if (method) {
                clazz.addMethod(method);
            }
        }

        clazz.addMethod(this.context.getToStringMethod());
        return new PhpFile({
            clazz,
            rootNamespace: this.context.getRootNamespace(),
            directory: this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory,
            customConfig: this.context.customConfig
        });
    }

    private getTypeField(): php.Field {
        // TODO(ajgateno): Actually add the literals as a union rather than just string
        return php.field({
            name: this.unionTypeDeclaration.discriminant.name.camelCase.safeName,
            type: php.Type.string(),
            access: "public",
            readonly_: true
        });
    }

    private getValueField(): php.Field {
        // TODO(ajgateno): Actually add the class references as a union rather than just mixed
        return php.field({
            name: "value",
            type: php.Type.mixed(),
            access: "public",
            readonly_: true
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

    private asCastMethod(type: SingleUnionType): php.Method | null {
        if (type.shape.propertiesType === "noProperties") {
            return null;
        }

        const methodName = "as" + type.discriminantValue.name.pascalCase.safeName;

        return php.method({
            name: methodName,
            access: "public",
            parameters: [],
            return_: this.getReturnType(type)
        });
    }

    private getReturnType(type: SingleUnionType): php.Type {
        return type.shape._visit({
            samePropertiesAsObject: (value: DeclaredTypeName) => {
                return php.Type.reference(this.context.phpTypeMapper.convertToClassReference(value));
            },
            singleProperty: (value: SingleUnionTypeProperty) => {
                return this.context.phpTypeMapper.convert({ reference: value.type });
            },
            noProperties: () => {
                return php.Type.null();
            },
            _other: (value) => {
                throw new Error("Got unexpected union type: " + value);
            }
        });
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory;
    }
}
