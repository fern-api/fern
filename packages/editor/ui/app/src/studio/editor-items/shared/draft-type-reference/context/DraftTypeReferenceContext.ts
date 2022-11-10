import { createContext, useContext } from "react";
import { DraftTypeReference } from "../tree/DraftTypeReference";
import { DraftTypeReferenceNodeId } from "../tree/DraftTypeReferenceNodeId";
import { DraftTypeReferenceTree } from "../tree/DraftTypeReferenceTree";

export const DraftTypeReferenceContext = createContext<() => DraftTypeReferenceContextValue>(() => {
    throw new Error("DraftTypeReferenceContext not found in tree");
});

export interface DraftTypeReferenceContextValue {
    root: DraftTypeReferenceNodeId;
    selectedNode: DraftTypeReference;
    invalidNodeId: DraftTypeReferenceNodeId | undefined;

    setSelectedNodeId: (nodeId: DraftTypeReferenceNodeId) => void;
    replaceSelectedNode: (newTree: DraftTypeReferenceTree) => void;
    getNode: (nodeId: DraftTypeReferenceNodeId) => DraftTypeReference;
    onClickNext: (() => void) | undefined;
    onClickPrevious: (() => void) | undefined;
    onClickSave: () => void;
    onClickCancel: () => void;
}

export function useDraftTypeReferenceContext(): DraftTypeReferenceContextValue {
    return useContext(DraftTypeReferenceContext)();
}
