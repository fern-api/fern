import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { MockDefinitionItem } from "./MockDefinitionItem";

export declare namespace MockError {
    export interface Init extends MockDefinitionItem.Init {
        name?: string;
    }
}

export class MockError extends MockDefinitionItem {
    public errorId: string;
    public errorName: string;

    constructor({ name = "Mock Error", ...superInit }: MockError.Init) {
        super(superInit);
        this.errorId = EditorItemIdGenerator.error();
        this.errorName = name;
    }
}
