import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockDefinitionItem } from "./MockDefinitionItem";

export declare namespace MockEndpoint {
    export interface Init extends MockDefinitionItem.Init {
        name?: string;
    }
}

export class MockEndpoint extends MockDefinitionItem {
    public endpointId: FernApiEditor.EndpointId;
    public endpointName: string;

    constructor({ name = "Mock Endpoint", ...superInit }: MockEndpoint.Init) {
        super(superInit);
        this.endpointId = EditorItemIdGenerator.endpoint();
        this.endpointName = name;
    }
}
