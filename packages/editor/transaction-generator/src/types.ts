import { FernApiEditor } from "@fern-fern/api-editor-sdk";

export type TransactionType = Exclude<FernApiEditor.transactions.Transaction["type"], void>;

export type TransactionFromType<K extends TransactionType> = Extract<
    FernApiEditor.transactions.Transaction,
    { type: K }
>;

export type TransactionPayload<K extends TransactionType> = Omit<
    TransactionFromType<K>,
    keyof FernApiEditor.transactions.BaseTransaction | "type" | "_visit"
>;
