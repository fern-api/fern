import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { MockDefinitionItem } from "./MockDefinitionItem";

export declare namespace MockType {
    export interface Init extends MockDefinitionItem.Init {
        name?: string;
    }
}

export class MockType extends MockDefinitionItem {
    public typeId: string;
    public typeName: string;

    constructor({ name = "Mock Type", ...superInit }: MockType.Init) {
        super(superInit);
        this.typeId = EditorItemIdGenerator.type();
        this.typeName = name;
    }
}
