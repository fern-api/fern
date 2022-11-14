import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { v4 as uuidv4 } from "uuid";

export interface EditorItemIdGenerator {
    package: () => FernApiEditor.PackageId;
    endpoint: () => FernApiEditor.EndpointId;
    type: () => FernApiEditor.TypeId;
    objectProperty: () => FernApiEditor.ObjectPropertyId;
    objectExtension: () => FernApiEditor.ObjectExtensionId;
    unionMember: () => FernApiEditor.UnionMemberId;
    error: () => FernApiEditor.ErrorId;
}

export const EditorItemIdGenerator: EditorItemIdGenerator = {
    package: () => uuidv4() as FernApiEditor.PackageId,
    endpoint: () => uuidv4() as FernApiEditor.EndpointId,
    type: () => uuidv4() as FernApiEditor.TypeId,
    objectProperty: () => uuidv4() as FernApiEditor.ObjectPropertyId,
    objectExtension: () => uuidv4() as FernApiEditor.ObjectExtensionId,
    unionMember: () => uuidv4() as FernApiEditor.UnionMemberId,
    error: () => uuidv4() as FernApiEditor.ErrorId,
};
