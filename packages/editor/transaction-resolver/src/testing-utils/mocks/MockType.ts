import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockDefinitionItem } from "./MockDefinitionItem";

export declare namespace MockType {
    export interface Init extends MockDefinitionItem.Init {
        name?: string;
        shape?: FernApiEditor.Shape;
    }
}

export class MockType extends MockDefinitionItem {
    public typeId: FernApiEditor.TypeId;
    public typeName: string;
    public shape: FernApiEditor.Shape;

    constructor({
        name = "Mock Type",
        shape = FernApiEditor.Shape.alias({
            aliasOf: FernApiEditor.TypeReference.primitive(FernApiEditor.PrimitiveType.String),
        }),
        ...superInit
    }: MockType.Init) {
        super(superInit);
        this.typeId = EditorItemIdGenerator.type();
        this.typeName = name;
        this.shape = shape;
    }
}
