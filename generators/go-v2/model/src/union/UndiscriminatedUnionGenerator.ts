import { GoFile } from "@fern-api/go-base";
import { go } from "@fern-api/go-ast";

import {
    ContainerType,
    Literal,
    NamedType,
    PrimitiveTypeV1,
    TypeDeclaration,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { AbstractModelGenerator } from "../AbstractModelGenerator";
import { assertNever } from "@fern-api/core-utils";

export class UndiscriminatedUnionGenerator extends AbstractModelGenerator {
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly unionDeclaration: UndiscriminatedUnionTypeDeclaration
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
        return this.unionDeclaration.members.map((member) => {
            return go.field({
                name: this.getMemberFieldName(member.type),
                type: this.context.goTypeMapper.convert({ reference: member.type }),
                docs: member.docs
            });
        });
    }

    private getMemberFieldName(typeReference: TypeReference): string {
        switch (typeReference.type) {
            case "named":
                return this.getMemberFieldNameForNamed({ named: typeReference });
            case "container":
                return this.getMemberFieldNameForContainer({ container: typeReference.container });
            case "primitive":
                return this.getMemeberFieldNameForPrimitive({ primitive: typeReference.primitive.v1 });
            case "unknown":
                return "Unknown";
            default:
                assertNever(typeReference);
        }
    }

    private getMemberFieldNameForNamed({ named }: { named: NamedType }): string {
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(named.typeId);
        return this.context.getFieldName(typeDeclaration.name.name);
    }

    private getMemberFieldNameForContainer({ container }: { container: ContainerType }): string {
        switch (container.type) {
            case "list":
                return this.getMemeberFieldNameForList({ list: container });
            case "map":
                return this.getMemeberFieldNameForMap({ map: container });
            case "set":
                return this.getMemeberFieldNameForSet({ set: container });
            case "optional":
                return this.getMemeberFieldNameForOptional({ optional: container });
            case "nullable":
                return this.getMemeberFieldNameForNullable({ nullable: container });
            case "literal":
                return this.getMemeberFieldNameForLiteral({ literal: container.literal });
            default:
                assertNever(container);
        }
    }

    private getMemeberFieldNameForList({ list }: { list: ContainerType.List }): string {
        const fieldName = this.getMemberFieldName(list.list);
        return `${fieldName}List`;
    }

    private getMemeberFieldNameForMap({ map }: { map: ContainerType.Map }): string {
        const keyFieldName = this.getMemberFieldName(map.keyType);
        const valueFieldName = this.getMemberFieldName(map.valueType);
        return `${keyFieldName}${valueFieldName}Map`;
    }

    private getMemeberFieldNameForOptional({ optional }: { optional: ContainerType.Optional }): string {
        const fieldName = this.getMemberFieldName(optional.optional);
        return `${fieldName}Optional`;
    }

    private getMemeberFieldNameForNullable({ nullable }: { nullable: ContainerType.Nullable }): string {
        const fieldName = this.getMemberFieldName(nullable.nullable);
        return `${fieldName}Optional`;
    }

    private getMemeberFieldNameForSet({ set }: { set: ContainerType.Set }): string {
        const fieldName = this.getMemberFieldName(set.set);
        return `${fieldName}Set`;
    }

    private getMemeberFieldNameForLiteral({ literal }: { literal: Literal }): string {
        switch (literal.type) {
            case "boolean":
                if (literal.boolean) {
                    return "TrueLiteral";
                }
                return "FalseLiteral";
            case "string":
                return `${literal.string}StringLiteral`;
            default:
                assertNever(literal);
        }
    }

    private getMemeberFieldNameForPrimitive({ primitive }: { primitive: PrimitiveTypeV1 }): string {
        switch (primitive) {
            case "INTEGER":
            case "UINT":
                return "Integer";
            case "LONG":
            case "UINT_64":
                return "Long";
            case "FLOAT":
            case "DOUBLE":
                return "Double";
            case "BOOLEAN":
                return "Boolean";
            case "BIG_INTEGER":
            case "STRING":
                return "String";
            case "UUID":
                return "Uuid";
            case "DATE":
                return "Date";
            case "DATE_TIME":
                return "DateTime";
            case "BASE_64":
                return "Base64";
            default:
                assertNever(primitive);
        }
    }
}
