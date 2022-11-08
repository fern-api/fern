import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class SetTypeShapeTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.SetTypeShapeTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.SetTypeShapeTransaction): void {
        const type = this.getTypeOrThrow(transaction.typeId);
        type.shape = transaction.shape.visit<FernApiEditor.Shape>({
            alias: () => FernApiEditor.Shape.alias({}),
            object: () => FernApiEditor.Shape.object({}),
            union: () => FernApiEditor.Shape.union({}),
            enum: () => FernApiEditor.Shape.enum({}),
            _other: (value) => {
                throw new Error("Unexpected shape type: " + value);
            },
        });
    }
}
