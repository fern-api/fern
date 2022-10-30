import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import produce from "immer";
import { v4 as uuidv4 } from "uuid";
import { TransactionHandler } from "./TransactionHandler";

export declare namespace TransactionResolver {
    export interface Init {
        api: FernApiEditor.Api;
    }

    export type Listener = (api: FernApiEditor.Api) => void;
}

type ListenerId = string;

export class TransactionResolver {
    #api: FernApiEditor.Api;
    private listeners: Record<ListenerId, TransactionResolver.Listener> = {};
    private transactionHandler: TransactionHandler;

    constructor({ api }: TransactionResolver.Init) {
        this.#api = api;
        this.transactionHandler = new TransactionHandler();
    }

    get api(): FernApiEditor.Api {
        return this.#api;
    }

    set api(api: FernApiEditor.Api) {
        this.#api = api;
    }

    public applyTransaction(transaction: FernApiEditor.transactions.Transaction): void {
        this.applyTransactions([transaction]);
    }

    public applyTransactions(transactions: readonly FernApiEditor.transactions.Transaction[]): void {
        this.api = produce(this.api, (draft) => {
            for (const transaction of transactions) {
                this.transactionHandler.applyTransaction(draft, transaction);
            }
        });

        for (const listener of Object.values(this.listeners)) {
            listener(this.api);
        }
    }

    public watch(listener: (api: FernApiEditor.Api) => void): () => void {
        const listenerId = uuidv4();
        this.listeners[listenerId] = listener;
        return () => {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.listeners[listenerId];
        };
    }
}
