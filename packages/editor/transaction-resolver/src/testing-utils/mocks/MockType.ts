import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { generateTypeId } from "../ids";
import { Mock } from "./Mock";

export class MockType extends Mock implements FernApiEditor.Type {
    public typeId: string;
    public typeName: string;

    constructor(name = "Mock Type") {
        super();
        this.typeId = generateTypeId();
        this.typeName = name;
    }
}
