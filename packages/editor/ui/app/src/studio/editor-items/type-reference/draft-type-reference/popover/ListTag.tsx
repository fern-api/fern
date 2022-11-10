import { useDraftTypeReferenceContext } from "../context/DraftTypeReferenceContext";
import { DraftTypeReferenceNode } from "../tree/DraftTypeReferenceNode";
import { ChangeTypeTag } from "./ChangeTypeTag";

export const ListTag: React.FC = () => {
    const { selectedNode } = useDraftTypeReferenceContext();
    const isSelected = selectedNode.type === "list";

    return <ChangeTypeTag label="list" isSelected={isSelected} generateTree={DraftTypeReferenceNode.list} />;
};
