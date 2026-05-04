import { getNameFromWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-ast";
import { GoFile } from "@fern-api/go-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { AbstractModelGenerator } from "../AbstractModelGenerator.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export class DiscriminatedUnionGenerator extends AbstractModelGenerator {
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: FernIr.TypeDeclaration,
        private readonly unionDeclaration: FernIr.UnionTypeDeclaration
    ) {
        super(context, typeDeclaration);
    }

    protected doGenerate(): GoFile {
        const struct_ = go.struct({
            ...this.typeReference,
            docs: this.typeDeclaration.docs
        });
        const fields = this.getFields();
        struct_.addField(...fields);
        return this.toFile(struct_);
    }

    private getFields(): go.Field[] {
        const fields: go.Field[] = [this.getDiscriminantField()];
        for (const property of this.getAllObjectProperties()) {
            const nameVal = property.name;
            fields.push(
                go.field({
                    name: this.context.getFieldName(nameVal),
                    type: this.context.goTypeMapper.convert({ reference: property.valueType }),
                    docs: property.docs
                })
            );
        }
        for (const type of this.unionDeclaration.types) {
            fields.push(this.getFieldForUnionType(type));
        }
        return fields;
    }

    private getDiscriminantField(): go.Field {
        const discName = getNameFromWireValue(this.unionDeclaration.discriminant);
        return go.field({
            name: this.context.getFieldName(discName),
            type: go.Type.string(),
            docs: this.typeDeclaration.docs
        });
    }

    private getFieldForUnionType(unionType: FernIr.SingleUnionType): go.Field {
        const shape = unionType.shape;
        switch (shape.propertiesType) {
            case "samePropertiesAsObject": {
                const typeDeclaration = this.context.getTypeDeclarationOrThrow(shape.typeId);
                const dvName = getNameFromWireValue(unionType.discriminantValue);
                return go.field({
                    name: this.context.getFieldName(dvName),
                    type: go.Type.reference(this.context.goTypeMapper.convertToTypeReference(typeDeclaration.name)),
                    docs: typeDeclaration.docs
                });
            }
            case "singleProperty": {
                const dvName = getNameFromWireValue(unionType.discriminantValue);
                return go.field({
                    name: this.context.getFieldName(dvName),
                    type: this.context.goTypeMapper.convert({ reference: shape.type })
                });
            }
            case "noProperties": {
                const dvName = getNameFromWireValue(unionType.discriminantValue);
                return go.field({
                    name: this.context.getFieldName(dvName),
                    type: go.Type.any(),
                    docs: unionType.docs
                });
            }
            default:
                assertNever(shape);
        }
    }

    private getAllObjectProperties(): FernIr.ObjectProperty[] {
        const extendedProperties: FernIr.ObjectProperty[] = [];
        for (const extendedType of this.unionDeclaration.extends) {
            const extendedTypeDeclaration = this.context.getTypeDeclarationOrThrow(extendedType.typeId);
            if (extendedTypeDeclaration.shape.type === "object") {
                extendedProperties.push(...extendedTypeDeclaration.shape.properties);
            }
        }
        return [...extendedProperties, ...(this.unionDeclaration.baseProperties ?? [])];
    }
}
