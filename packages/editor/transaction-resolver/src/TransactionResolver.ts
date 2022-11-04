import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import produce from "immer";
import { TransactionHandler } from "./TransactionHandler";

export declare namespace TransactionResolver {
    export interface Init {
        definition: FernApiEditor.Api;
    }

    export type Listener = (definition: FernApiEditor.Api) => void;
}

export class TransactionResolver {
    #definition: FernApiEditor.Api;
    private listeners = new Set<TransactionResolver.Listener>();
    private transactionHandler: TransactionHandler;

    constructor({ definition }: TransactionResolver.Init) {
        this.#definition = definition;
        this.transactionHandler = new TransactionHandler(definition);
    }

    get definition(): FernApiEditor.Api {
        return this.#definition;
    }

    set definition(definition: FernApiEditor.Api) {
        this.#definition = definition;
    }

    public applyTransaction(transaction: FernApiEditor.transactions.Transaction): FernApiEditor.Api {
        return this.applyTransactions([transaction]);
    }

    public applyTransactions(transactions: readonly FernApiEditor.transactions.Transaction[]): FernApiEditor.Api {
        this.definition = produce(this.definition, (draft) => {
            for (const transaction of transactions) {
                this.transactionHandler.applyTransaction(draft, transaction);
            }
        });

        for (const listener of this.listeners.values()) {
            listener(this.definition);
        }

        return this.definition;
    }

    public watch(listener: (api: FernApiEditor.Api) => void): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
}
