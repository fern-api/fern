import { ExampleTypeShape, UndiscriminatedUnionTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, getWriterForMultiLineUnionType, maybeAddDocs } from "@fern-typescript/commons";
import { GeneratedUndiscriminatedUnionType, ModelContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";

export class GeneratedUndiscriminatedUnionTypeImpl<Context extends ModelContext>
    extends AbstractGeneratedType<UndiscriminatedUnionTypeDeclaration, Context>
    implements GeneratedUndiscriminatedUnionType<Context>
{
    public readonly type = "undiscriminatedUnion";

    public writeToFile(context: Context): void {
        const type = context.sourceFile.addTypeAlias({
            name: this.typeName,
            isExported: true,
            type: getWriterForMultiLineUnionType(
                this.shape.members.map((value) => ({
                    docs: value.docs,
                    node: context.type.getReferenceToType(value.type).typeNode
                }))
            )
        });

        maybeAddDocs(type, this.getDocs(context));
    }

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "undiscriminatedUnion") {
            throw new Error("Example is not for an undiscriminated union");
        }

        return context.type.getGeneratedExample(example.singleUnionType).build(context, opts);
    }
}
