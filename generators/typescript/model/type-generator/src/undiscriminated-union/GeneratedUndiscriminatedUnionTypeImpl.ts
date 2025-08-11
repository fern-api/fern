import {
    GetReferenceOpts,
    getWriterForMultiLineUnionType,
    maybeAddDocsNode,
    maybeAddDocsStructure
} from "@fern-typescript/commons";
import { BaseContext, GeneratedUndiscriminatedUnionType } from "@fern-typescript/contexts";
import {
    ModuleDeclarationStructure,
    StatementStructures,
    StructureKind,
    TypeAliasDeclarationStructure,
    WriterFunction,
    ts
} from "ts-morph";

import {
    ExampleTypeShape,
    UndiscriminatedUnionMember,
    UndiscriminatedUnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";

import { AbstractGeneratedType } from "../AbstractGeneratedType";

export class GeneratedUndiscriminatedUnionTypeImpl<Context extends BaseContext>
    extends AbstractGeneratedType<UndiscriminatedUnionTypeDeclaration, Context>
    implements GeneratedUndiscriminatedUnionType<Context>
{
    public readonly type = "undiscriminatedUnion";

    public generateStatements(
        context: Context
    ): string | WriterFunction | (string | WriterFunction | StatementStructures)[] {
        const statements: StatementStructures[] = [this.generateTypeAlias(context)];
        return statements;
    }

    public generateForInlineUnion(context: Context): ts.TypeNode {
        return ts.factory.createUnionTypeNode(this.shape.members.map((value) => this.getTypeNode(context, value)));
    }

    public generateModule(): ModuleDeclarationStructure | undefined {
        return undefined;
    }

    private generateTypeAlias(context: Context): TypeAliasDeclarationStructure {
        const alias: TypeAliasDeclarationStructure = {
            name: this.typeName,
            kind: StructureKind.TypeAlias,
            isExported: true,
            type: getWriterForMultiLineUnionType(
                this.shape.members.map((value) => {
                    return {
                        docs: value.docs,
                        node: this.getTypeNode(context, value)
                    };
                })
            )
        };
        maybeAddDocsStructure(alias, this.getDocs(context));
        return alias;
    }

    private getTypeNode(context: Context, member: UndiscriminatedUnionMember): ts.TypeNode {
        return context.type.getReferenceToTypeForInlineUnion(member.type).typeNode;
    }

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "undiscriminatedUnion") {
            throw new Error("Example is not for an undiscriminated union");
        }

        return context.type.getGeneratedExample(example.singleUnionType).build(context, opts);
    }
}
