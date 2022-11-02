import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { Mock } from "./Mock";

export declare namespace MockDefinitionItem {
    export interface Init {
        applyTransaction: (transaction: FernApiEditor.transactions.Transaction) => void;
    }
}

export abstract class MockDefinitionItem extends Mock {
    protected applyTransaction: (transaction: FernApiEditor.transactions.Transaction) => void;

    constructor({ applyTransaction }: MockDefinitionItem.Init) {
        super();
        this.applyTransaction = applyTransaction;
    }
}
