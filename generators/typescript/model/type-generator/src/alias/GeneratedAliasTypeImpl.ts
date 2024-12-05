import { ExampleTypeShape, TypeReference } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, getTextOfTsNode, maybeAddDocs, writerToString } from "@fern-typescript/commons";
import { ModelContext, NotBrandedGeneratedAliasType } from "@fern-typescript/contexts";
import { StatementStructures, StructureKind, ts, TypeAliasDeclarationStructure, WriterFunction } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";

export class GeneratedAliasTypeImpl<Context extends ModelContext>
    extends AbstractGeneratedType<TypeReference, Context>
    implements NotBrandedGeneratedAliasType<Context>
{
    public readonly type = "alias";
    public readonly isBranded = false;

    public writeToFile(context: Context): void {
        context.sourceFile.addTypeAlias(this.generateTypeAlias(context));
    }

    public generateStatements(
        context: Context
    ): string | WriterFunction | (string | WriterFunction | StatementStructures)[] {
        return [this.generateTypeAlias(context)];
    }

    public generateForInlineUnion(context: Context): ts.TypeNode {
        const type = writerToString(this.generateTypeAlias(context).type);
        return ts.factory.createTypeReferenceNode(type);
    }

    private generateTypeAlias(context: Context): TypeAliasDeclarationStructure {
        const typeAlias: TypeAliasDeclarationStructure = {
            kind: StructureKind.TypeAlias,
            name: this.typeName,
            type: getTextOfTsNode(context.type.getReferenceToType(this.shape).typeNode),
            isExported: true
        };
        maybeAddDocs(typeAlias, this.getDocs(context));
        return typeAlias;
    }

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "alias") {
            throw new Error("Example is not for an alias");
        }
        return context.type.getGeneratedExample(example.value).build(context, opts);
    }
}
