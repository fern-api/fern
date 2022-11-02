import { AbstractTransactionHandler } from "./AbstractTransactionHandler";

export abstract class AbstractCreateTransactionHander<T> extends AbstractTransactionHandler<T> {
    public applyTransaction(transaction: T): void {
        this.addToDefinition(transaction);
        this.addToParent(transaction);
        this.addToGraph(transaction);
    }

    protected abstract addToDefinition(transaction: T): void;
    protected abstract addToParent(transaction: T): void;
    protected abstract addToGraph(transaction: T): void;
}
