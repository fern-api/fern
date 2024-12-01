import { ExampleTypeShape, TypeReference } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
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
    ): string | WriterFunction | readonly (string | WriterFunction | StatementStructures)[] {
        return [this.generateTypeAlias(context)];
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
