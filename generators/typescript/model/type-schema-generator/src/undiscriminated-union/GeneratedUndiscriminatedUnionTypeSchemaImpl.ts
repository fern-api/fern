import { FernIr } from "@fern-fern/ir-sdk";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getTextOfTsNode, Zurg } from "@fern-typescript/commons";
import { GeneratedUndiscriminatedUnionTypeSchema, ModelContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema.js";

export class GeneratedUndiscriminatedUnionTypeSchemaImpl<Context extends ModelContext>
    extends AbstractGeneratedTypeSchema<FernIr.UndiscriminatedUnionTypeDeclaration, Context>
    implements GeneratedUndiscriminatedUnionTypeSchema<Context>
{
    public readonly type = "undiscriminatedUnion";

    protected override buildSchema(context: Context): Zurg.Schema {
        return context.coreUtilities.zurg.undiscriminatedUnion(
            this.shape.members.map((member) => context.typeSchema.getSchemaOfTypeReference(member.type))
        );
    }

    protected override generateRawTypeDeclaration(context: Context, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode(
                    this.shape.members.map((member) => this.getRawTypeNodeForMember(context, member))
                )
            ),
            isExported: true
        });
    }

    private getRawTypeNodeForMember(context: Context, member: FernIr.UndiscriminatedUnionMember): ts.TypeNode {
        if (
            member.type.type !== "container" ||
            member.type.container.type !== "map" ||
            !isStringKey(member.type.container.keyType) ||
            !this.isSelfRecursive(member.type.container.valueType)
        ) {
            return context.typeSchema.getReferenceToRawType(member.type).typeNode;
        }

        // A type alias can't reference itself through Record (TS2456), but it can through an index signature.
        return ts.factory.createTypeLiteralNode([
            ts.factory.createIndexSignature(
                undefined,
                [
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        "key",
                        undefined,
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                    )
                ],
                context.typeSchema.getReferenceToRawType(member.type.container.valueType).typeNode
            )
        ]);
    }

    private isSelfRecursive(typeRef: FernIr.TypeReference): boolean {
        const unwrapped = unwrapOptionalAndNullable(typeRef);
        return unwrapped.type === "named" && this.case.pascalUnsafe(unwrapped.name) === this.typeName;
    }
}

function isStringKey(keyType: FernIr.TypeReference): boolean {
    return keyType.type === "primitive" && keyType.primitive.v1 === "STRING";
}

function unwrapOptionalAndNullable(typeReference: FernIr.TypeReference): FernIr.TypeReference {
    if (typeReference.type === "container") {
        if (typeReference.container.type === "optional") {
            return unwrapOptionalAndNullable(typeReference.container.optional);
        }
        if (typeReference.container.type === "nullable") {
            return unwrapOptionalAndNullable(typeReference.container.nullable);
        }
    }

    return typeReference;
}
