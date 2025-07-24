import { GoFile } from "@fern-api/go-base";
import { go } from "@fern-api/go-ast";

import { ObjectProperty, SingleUnionType, TypeDeclaration, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { AbstractModelGenerator } from "../AbstractModelGenerator";
import { assertNever } from "@fern-api/core-utils";

export class DiscriminatedUnionGenerator extends AbstractModelGenerator {
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly unionDeclaration: UnionTypeDeclaration
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
            fields.push(
                go.field({
                    name: this.context.getFieldName(property.name.name),
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
        return go.field({
            name: this.context.getFieldName(this.unionDeclaration.discriminant.name),
            type: go.Type.string(),
            docs: this.typeDeclaration.docs
        });
    }

    private getFieldForUnionType(unionType: SingleUnionType): go.Field {
        const shape = unionType.shape;
        switch (shape.propertiesType) {
            case "samePropertiesAsObject": {
                const typeDeclaration = this.context.getTypeDeclarationOrThrow(shape.typeId);
                return go.field({
                    name: this.context.getFieldName(unionType.discriminantValue.name),
                    type: go.Type.reference(this.context.goTypeMapper.convertToTypeReference(typeDeclaration.name)),
                    docs: typeDeclaration.docs
                });
            }
            case "singleProperty":
                return go.field({
                    name: this.context.getFieldName(unionType.discriminantValue.name),
                    type: this.context.goTypeMapper.convert({ reference: shape.type })
                });
            case "noProperties":
                return go.field({
                    name: this.context.getFieldName(unionType.discriminantValue.name),
                    type: go.Type.any(),
                    docs: unionType.docs
                });
            default:
                assertNever(shape);
        }
    }

    private getAllObjectProperties(): ObjectProperty[] {
        const extendedProperties: ObjectProperty[] = [];
        for (const extenedType of this.unionDeclaration.extends) {
            const extendedTypeDeclaration = this.context.getTypeDeclarationOrThrow(extenedType.typeId);
            if (extendedTypeDeclaration.shape.type === "object") {
                extendedProperties.push(...extendedTypeDeclaration.shape.properties);
            }
        }
        return [...extendedProperties, ...(this.unionDeclaration.baseProperties ?? [])];
    }
}
