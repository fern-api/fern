import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockDefinitionItem } from "./MockDefinitionItem";

export declare namespace MockError {
    export interface Init extends MockDefinitionItem.Init {
        name?: string;
    }
}

export class MockError extends MockDefinitionItem {
    public errorId: FernApiEditor.ErrorId;
    public errorName: string;

    constructor({ name = "Mock Error", ...superInit }: MockError.Init) {
        super(superInit);
        this.errorId = EditorItemIdGenerator.error();
        this.errorName = name;
    }
}
