import { useDraftTypeReferenceContext } from "../context/DraftTypeReferenceContext";
import { DraftTypeReference } from "../tree/DraftTypeReference";
import { ChangeTypeTag } from "./ChangeTypeTag";

export const ListTag: React.FC = () => {
    const { selectedNode } = useDraftTypeReferenceContext();
    const isSelected = selectedNode.type === "list";

    return <ChangeTypeTag label="list" isSelected={isSelected} generateTree={DraftTypeReference.list} />;
};
