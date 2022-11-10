import { assertNever } from "@fern-api/core-utils";
import { pickBy } from "lodash-es";
import { DraftTypeReference } from "./DraftTypeReference";
import { DraftTypeReferenceNodeId } from "./DraftTypeReferenceNodeId";

export interface DraftTypeReferenceTree {
    root: DraftTypeReferenceNodeId;
    nodes: Record<DraftTypeReferenceNodeId, DraftTypeReference>;
}

export const DraftTypeReferenceTree = {
    preOrderTraverse: (tree: DraftTypeReferenceTree): DraftTypeReferenceNodeId[] => preOrderTraverse(tree, tree.root),

    replace: (
        tree: DraftTypeReferenceTree,
        nodeId: DraftTypeReferenceNodeId,
        newTree: DraftTypeReferenceTree
    ): DraftTypeReferenceTree => {
        const { parent } = DraftTypeReferenceTree.get(tree, nodeId);
        if (parent == null) {
            return newTree;
        }

        const oldChildren = DraftTypeReferenceTree.getAllChildren(tree, nodeId);

        return {
            root: tree.root,
            nodes: {
                ...pickBy(
                    tree.nodes,
                    (_, existingNodeId) => !oldChildren.has(existingNodeId as DraftTypeReferenceNodeId)
                ),
                ...pickBy(newTree.nodes, (_, existingNodeId) => existingNodeId !== newTree.root),
                [nodeId]: {
                    ...DraftTypeReferenceTree.get(newTree, newTree.root),
                    id: nodeId,
                    parent,
                },
            },
        };
    },

    get: (tree: DraftTypeReferenceTree, nodeId: DraftTypeReferenceNodeId): DraftTypeReference => {
        const node = tree.nodes[nodeId];
        if (node == null) {
            throw new Error("Node does not exist: " + nodeId);
        }
        return node;
    },

    getAllChildren: (tree: DraftTypeReferenceTree, nodeId: DraftTypeReferenceNodeId): Set<DraftTypeReferenceNodeId> => {
        const node = DraftTypeReferenceTree.get(tree, nodeId);
        switch (node.type) {
            case "list":
            case "optional":
            case "set":
                return new Set([node.itemType, ...DraftTypeReferenceTree.getAllChildren(tree, node.itemType)]);
            case "map":
                return new Set([
                    node.keyType,
                    node.valueType,
                    ...DraftTypeReferenceTree.getAllChildren(tree, node.keyType),
                    ...DraftTypeReferenceTree.getAllChildren(tree, node.valueType),
                ]);
            case "primitive":
            case "named":
            case "literal":
            case "unknown":
            case "placeholder":
                return new Set();
            default:
                assertNever(node);
        }
    },

    subtree: (tree: DraftTypeReferenceTree, nodeId: DraftTypeReferenceNodeId): DraftTypeReferenceTree => {
        const children = DraftTypeReferenceTree.getAllChildren(tree, nodeId);
        return {
            root: nodeId,
            nodes: {
                ...pickBy(tree.nodes, (_, existingNodeId) => children.has(existingNodeId as DraftTypeReferenceNodeId)),
                [nodeId]: {
                    ...DraftTypeReferenceTree.get(tree, nodeId),
                    parent: undefined,
                },
            },
        };
    },
};

function preOrderTraverse(tree: DraftTypeReferenceTree, nodeId: DraftTypeReferenceNodeId): DraftTypeReferenceNodeId[] {
    const node = DraftTypeReferenceTree.get(tree, nodeId);
    switch (node.type) {
        case "list":
        case "optional":
        case "set":
            return [node.id, ...preOrderTraverse(tree, node.itemType)];
        case "map":
            return [node.id, ...preOrderTraverse(tree, node.keyType), ...preOrderTraverse(tree, node.valueType)];
        case "primitive":
        case "named":
        case "literal":
        case "unknown":
        case "placeholder":
            return [node.id];
        default:
            assertNever(node);
    }
}
