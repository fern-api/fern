import { AbstractTransactionHandler } from "./AbstractTransactionHandler";

export abstract class AbstractDeleteTransactionHander<T> extends AbstractTransactionHandler<T> {
    public applyTransaction(transaction: T): void {
        this.removeDefinition(transaction);
        this.removeFromParent(transaction);
        this.removeFromGraph(transaction);
    }

    protected abstract removeDefinition(transaction: T): void;
    protected abstract removeFromParent(transaction: T): void;
    protected abstract removeFromGraph(transaction: T): void;
}
