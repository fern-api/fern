import { assertNever } from "@fern-api/core-utils";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { DraftTypeReferenceNodeId } from "../tree/DraftTypeReferenceNodeId";
import { DraftTypeReferenceTree } from "../tree/DraftTypeReferenceTree";

export function convertDraftNodeToTypeReference(
    nodeId: DraftTypeReferenceNodeId,
    tree: DraftTypeReferenceTree
): FernApiEditor.TypeReference {
    const node = DraftTypeReferenceTree.get(tree, nodeId);
    switch (node.type) {
        case "list":
            return FernApiEditor.TypeReference.container(
                FernApiEditor.ContainerType.list(convertDraftNodeToTypeReference(node.itemType, tree))
            );
        case "optional":
            return FernApiEditor.TypeReference.container(
                FernApiEditor.ContainerType.optional(convertDraftNodeToTypeReference(node.itemType, tree))
            );
        case "set":
            return FernApiEditor.TypeReference.container(
                FernApiEditor.ContainerType.set(convertDraftNodeToTypeReference(node.itemType, tree))
            );
        case "map":
            return FernApiEditor.TypeReference.container(
                FernApiEditor.ContainerType.map({
                    keyType: convertDraftNodeToTypeReference(node.keyType, tree),
                    valueType: convertDraftNodeToTypeReference(node.valueType, tree),
                })
            );
        case "primitive":
            return FernApiEditor.TypeReference.primitive(node.primitive);
        case "named":
            return FernApiEditor.TypeReference.named(node.typeId);
        case "literal":
            return FernApiEditor.TypeReference.container(FernApiEditor.ContainerType.literal(node.literal));
        case "unknown":
            return FernApiEditor.TypeReference.unknown();
        case "placeholder":
            throw new Error("Cannot convert placeholder node to TypeRefernence");
        default:
            assertNever(node);
    }
}
