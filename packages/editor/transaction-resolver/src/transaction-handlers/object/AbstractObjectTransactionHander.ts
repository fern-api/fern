import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { Draft } from "immer";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export abstract class AbstractObjectTransactionHander<T> extends AbstractTransactionHandler<T> {
    protected getObjectOrThrow(objectId: FernApiEditor.TypeId): Draft<FernApiEditor.ObjectShape> {
        const type = this.getTypeOrThrow(objectId);
        if (type.shape.type !== "object") {
            throw new Error(`Type ${objectId} is not an object`);
        }
        return type.shape;
    }

    protected getObjectPropertyOrThrow(
        objectId: FernApiEditor.TypeId,
        propertyId: FernApiEditor.ObjectPropertyId
    ): Draft<FernApiEditor.ObjectProperty> {
        const object = this.getObjectOrThrow(objectId);
        const property = object.properties.find((property) => property.propertyId === propertyId);
        if (property == null) {
            throw new Error(`Property ${propertyId} does not exist`);
        }
        return property;
    }
}
