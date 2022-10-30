import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { generateEndpointId } from "../ids";
import { Mock } from "./Mock";

export class MockEndpoint extends Mock implements FernApiEditor.Endpoint {
    public endpointId: string;
    public endpointName: string;

    constructor(name = "Mock Endpoint") {
        super();
        this.endpointId = generateEndpointId();
        this.endpointName = name;
    }
}
