import { createContext, useContext } from "react";
import { DraftTypeReferenceNode } from "../tree/DraftTypeReferenceNode";
import { DraftTypeReferenceNodeId } from "../tree/DraftTypeReferenceNodeId";
import { DraftTypeReferenceTree } from "../tree/DraftTypeReferenceTree";

export const DraftTypeReferenceContext = createContext<() => DraftTypeReferenceContextValue>(() => {
    throw new Error("DraftTypeReferenceContext not found in tree");
});

export interface DraftTypeReferenceContextValue {
    tree: DraftTypeReferenceTree;
    selectedNode: DraftTypeReferenceNode;
    invalidNodeId: DraftTypeReferenceNodeId | undefined;

    setSelectedNodeId: (nodeId: DraftTypeReferenceNodeId) => void;
    replaceSelectedNode: (newTree: DraftTypeReferenceTree) => void;
    getNode: (nodeId: DraftTypeReferenceNodeId) => DraftTypeReferenceNode;
    onClickNext: (() => void) | undefined;
    onClickPrevious: (() => void) | undefined;
    onClickSave: () => void;
    onClickCancel: () => void;
}

export function useDraftTypeReferenceContext(): DraftTypeReferenceContextValue {
    return useContext(DraftTypeReferenceContext)();
}
