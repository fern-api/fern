import {
    ExampleTypeShape,
    UndiscriminatedUnionMember,
    UndiscriminatedUnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, getWriterForMultiLineUnionType, maybeAddDocs } from "@fern-typescript/commons";
import { GeneratedUndiscriminatedUnionType, BaseContext } from "@fern-typescript/contexts";
import {
    ModuleDeclarationStructure,
    StatementStructures,
    StructureKind,
    ts,
    TypeAliasDeclarationStructure,
    WriterFunction
} from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";

export class GeneratedUndiscriminatedUnionTypeImpl<Context extends BaseContext>
    extends AbstractGeneratedType<UndiscriminatedUnionTypeDeclaration, Context>
    implements GeneratedUndiscriminatedUnionType<Context>
{
    public readonly type = "undiscriminatedUnion";

    public writeToFile(context: Context): void {
        context.sourceFile.addStatements(this.generateStatements(context));
    }

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
        maybeAddDocs(alias, this.getDocs(context));
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
