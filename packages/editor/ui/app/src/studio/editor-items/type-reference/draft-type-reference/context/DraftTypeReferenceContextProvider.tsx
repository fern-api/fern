import { assertNever } from "@fern-api/core-utils";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { PropsWithChildren, useCallback, useMemo, useReducer } from "react";
import { DraftTypeReferenceNodeId } from "../tree/DraftTypeReferenceNodeId";
import { DraftTypeReferenceTree } from "../tree/DraftTypeReferenceTree";
import { convertDraftNodeToTypeReference } from "./convertDraftTreeToTypeReference";
import { convertTypeReferenceToDraftTree } from "./convertTypeReferenceToDraftTree";
import { DraftTypeReferenceContext, DraftTypeReferenceContextValue } from "./DraftTypeReferenceContext";

export declare namespace DraftTypeReferenceContextProvider {
    export type Props = PropsWithChildren<{
        typeReference: FernApiEditor.TypeReference;
        onSave: (typeReference: FernApiEditor.TypeReference) => void;
        onCancel: () => void;
    }>;
}

export const DraftTypeReferenceContextProvider: React.FC<DraftTypeReferenceContextProvider.Props> = ({
    typeReference,
    onSave,
    onCancel,
    children,
}) => {
    const [state, dispatch] = useReducer(reducer, undefined, (): State => {
        const tree = convertTypeReferenceToDraftTree(typeReference);
        return {
            tree,
            nodesInOrder: DraftTypeReferenceTree.preOrderTraverse(tree),
            selectedNodeIndex: 0,
            invalidNodeId: undefined,
        };
    });

    const setSelectedNodeId = useCallback((nodeId: DraftTypeReferenceNodeId) => {
        dispatch({ type: "selectNode", nodeId });
    }, []);

    const onClickNext = useMemo(() => {
        if (state.selectedNodeIndex === state.nodesInOrder.length - 1) {
            return undefined;
        }
        return () => {
            dispatch({ type: "goToNext" });
        };
    }, [state.selectedNodeIndex, state.nodesInOrder.length]);

    const onClickPrevious = useMemo(() => {
        if (state.selectedNodeIndex === 0) {
            return undefined;
        }
        return () => {
            dispatch({ type: "goToPrevious" });
        };
    }, [state.selectedNodeIndex]);

    const selectedNodeId = state.nodesInOrder[state.selectedNodeIndex];
    if (selectedNodeId == null) {
        throw new Error("Node does not exist at index: " + state.selectedNodeIndex);
    }
    const selectedNode = DraftTypeReferenceTree.get(state.tree, selectedNodeId);

    const replaceSelectedNode = useCallback((newTree: DraftTypeReferenceTree) => {
        dispatch({ type: "replaceNode", newTree });
    }, []);

    const getNode = useCallback(
        (nodeId: DraftTypeReferenceNodeId) => {
            return DraftTypeReferenceTree.get(state.tree, nodeId);
        },
        [state.tree]
    );

    const onClickSave = useCallback(() => {
        const firstPlaceholderNode = getNextPlaceholderNode({ tree: state.tree, nodesInOrder: state.nodesInOrder });
        if (firstPlaceholderNode != null) {
            dispatch({
                type: "setInvalidNode",
                nodeId: firstPlaceholderNode.nodeId,
            });
        } else {
            onSave(convertDraftNodeToTypeReference(state.tree.root, state.tree));
        }
    }, [onSave, state.nodesInOrder, state.tree]);

    const draftContextValue = useCallback(
        (): DraftTypeReferenceContextValue => ({
            tree: state.tree,
            selectedNode,
            invalidNodeId: state.invalidNodeId,
            setSelectedNodeId,
            replaceSelectedNode,
            onClickNext,
            onClickPrevious,
            getNode,
            onClickSave,
            onClickCancel: onCancel,
        }),
        [
            state.tree,
            state.invalidNodeId,
            selectedNode,
            setSelectedNodeId,
            replaceSelectedNode,
            onClickNext,
            onClickPrevious,
            getNode,
            onClickSave,
            onCancel,
        ]
    );

    return (
        <DraftTypeReferenceContext.Provider value={draftContextValue}>{children}</DraftTypeReferenceContext.Provider>
    );
};

interface State {
    tree: DraftTypeReferenceTree;
    nodesInOrder: DraftTypeReferenceNodeId[];
    selectedNodeIndex: number;
    invalidNodeId: DraftTypeReferenceNodeId | undefined;
}

type Action =
    | ReplaceSelectedNodeAction
    | GoToPreviousNodeAction
    | GoToNextNodeAction
    | SelectNodeAction
    | SetInvalidNodeAction;

interface ReplaceSelectedNodeAction {
    type: "replaceNode";
    newTree: DraftTypeReferenceTree;
}

interface GoToPreviousNodeAction {
    type: "goToPrevious";
}

interface GoToNextNodeAction {
    type: "goToNext";
}

interface SelectNodeAction {
    type: "selectNode";
    nodeId: DraftTypeReferenceNodeId;
}

interface SetInvalidNodeAction {
    type: "setInvalidNode";
    nodeId: DraftTypeReferenceNodeId;
}

function reducer(state: State, action: Action): State {
    const getIndexOfNode = (nodeId: DraftTypeReferenceNodeId) => {
        const indexOfNode = state.nodesInOrder.indexOf(nodeId);
        if (indexOfNode === -1) {
            throw new Error("Node does not exist: " + nodeId);
        }
        return indexOfNode;
    };

    switch (action.type) {
        case "replaceNode": {
            const selectedNodeId = state.nodesInOrder[state.selectedNodeIndex];
            if (selectedNodeId == null) {
                throw new Error("Node does not exist at index: " + state.selectedNodeIndex);
            }
            const newTree = DraftTypeReferenceTree.replace(state.tree, selectedNodeId, action.newTree);
            const newOrder = DraftTypeReferenceTree.preOrderTraverse(newTree);

            const nextPlaceholderNode = getNextPlaceholderNode({
                tree: newTree,
                nodesInOrder: newOrder,
                startingIndex: state.selectedNodeIndex,
            });

            return {
                tree: newTree,
                nodesInOrder: newOrder,
                selectedNodeIndex: nextPlaceholderNode?.index ?? state.selectedNodeIndex,
                invalidNodeId: undefined,
            };
        }
        case "goToNext":
            return {
                tree: state.tree,
                nodesInOrder: state.nodesInOrder,
                selectedNodeIndex: state.selectedNodeIndex + 1,
                invalidNodeId: undefined,
            };
        case "goToPrevious":
            return {
                tree: state.tree,
                nodesInOrder: state.nodesInOrder,
                selectedNodeIndex: state.selectedNodeIndex - 1,
                invalidNodeId: undefined,
            };
        case "selectNode": {
            return {
                tree: state.tree,
                nodesInOrder: state.nodesInOrder,
                selectedNodeIndex: getIndexOfNode(action.nodeId),
                invalidNodeId: undefined,
            };
        }
        case "setInvalidNode":
            return {
                tree: state.tree,
                nodesInOrder: state.nodesInOrder,
                invalidNodeId: action.nodeId,
                selectedNodeIndex: getIndexOfNode(action.nodeId),
            };
        default:
            assertNever(action);
    }
}

function getNextPlaceholderNode({
    tree,
    nodesInOrder,
    startingIndex = 0,
}: {
    tree: DraftTypeReferenceTree;
    nodesInOrder: DraftTypeReferenceNodeId[];
    startingIndex?: number;
}): { index: number; nodeId: DraftTypeReferenceNodeId } | undefined {
    for (let index = startingIndex; index < nodesInOrder.length; index++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nodeId = nodesInOrder[index]!;
        const node = DraftTypeReferenceTree.get(tree, nodeId);
        if (node.type === "placeholder") {
            return { index, nodeId };
        }
    }
    return undefined;
}
