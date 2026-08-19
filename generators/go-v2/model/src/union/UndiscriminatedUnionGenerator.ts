import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-ast";
import { GoFile } from "@fern-api/go-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { AbstractModelGenerator } from "../AbstractModelGenerator.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export class UndiscriminatedUnionGenerator extends AbstractModelGenerator {
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: FernIr.TypeDeclaration,
        private readonly unionDeclaration: FernIr.UndiscriminatedUnionTypeDeclaration
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

    private getMemberFieldName(typeReference: FernIr.TypeReference): string {
        switch (typeReference.type) {
            case "named":
                return this.getMemberFieldNameForNamed({ named: typeReference });
            case "container":
                return this.getMemberFieldNameForContainer({ container: typeReference.container });
            case "primitive":
                return this.getMemberFieldNameForPrimitive({ primitive: typeReference.primitive.v1 });
            case "unknown":
                return "Unknown";
            default:
                assertNever(typeReference);
        }
    }

    private getMemberFieldNameForNamed({ named }: { named: FernIr.NamedType }): string {
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(named.typeId);
        return this.context.getFieldName(typeDeclaration.name.name);
    }

    private getMemberFieldNameForContainer({ container }: { container: FernIr.ContainerType }): string {
        switch (container.type) {
            case "list":
                return this.getMemberFieldNameForList({ list: container });
            case "map":
                return this.getMemberFieldNameForMap({ map: container });
            case "set":
                return this.getMemberFieldNameForSet({ set: container });
            case "optional":
                return this.getMemberFieldNameForOptional({ optional: container });
            case "nullable":
                return this.getMemberFieldNameForNullable({ nullable: container });
            case "literal":
                return this.getMemberFieldNameForLiteral({ literal: container.literal });
            default:
                assertNever(container);
        }
    }

    private getMemberFieldNameForList({ list }: { list: FernIr.ContainerType.List }): string {
        const fieldName = this.getMemberFieldName(list.list);
        return `${fieldName}List`;
    }

    private getMemberFieldNameForMap({ map }: { map: FernIr.ContainerType.Map }): string {
        const keyFieldName = this.getMemberFieldName(map.keyType);
        const valueFieldName = this.getMemberFieldName(map.valueType);
        return `${keyFieldName}${valueFieldName}Map`;
    }

    private getMemberFieldNameForOptional({ optional }: { optional: FernIr.ContainerType.Optional }): string {
        const fieldName = this.getMemberFieldName(optional.optional);
        return `${fieldName}Optional`;
    }

    private getMemberFieldNameForNullable({ nullable }: { nullable: FernIr.ContainerType.Nullable }): string {
        const fieldName = this.getMemberFieldName(nullable.nullable);
        return `${fieldName}Optional`;
    }

    private getMemberFieldNameForSet({ set }: { set: FernIr.ContainerType.Set }): string {
        const fieldName = this.getMemberFieldName(set.set);
        return `${fieldName}Set`;
    }

    private getMemberFieldNameForLiteral({ literal }: { literal: FernIr.Literal }): string {
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

    private getMemberFieldNameForPrimitive({ primitive }: { primitive: FernIr.PrimitiveTypeV1 }): string {
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
            case "DATE_TIME_RFC_2822":
                return "DateTimeRfc2822";
            case "BASE_64":
                return "Base64";
            default:
                assertNever(primitive);
        }
    }
}
