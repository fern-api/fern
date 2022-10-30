import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { generateErrorId } from "../ids";
import { Mock } from "./Mock";

export class MockError extends Mock implements FernApiEditor.Error {
    public errorId: string;
    public errorName: string;
    public statusCode = "400";

    constructor(name = "Mock Error") {
        super();
        this.errorId = generateErrorId();
        this.errorName = name;
    }
}
