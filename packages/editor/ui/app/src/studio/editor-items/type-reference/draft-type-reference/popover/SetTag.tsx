import { useDraftTypeReferenceContext } from "../context/DraftTypeReferenceContext";
import { DraftTypeReference } from "../tree/DraftTypeReference";
import { ChangeTypeTag } from "./ChangeTypeTag";

export const SetTag: React.FC = () => {
    const { selectedNode } = useDraftTypeReferenceContext();
    const isSelected = selectedNode.type === "set";

    return <ChangeTypeTag label="set" isSelected={isSelected} generateTree={DraftTypeReference.set} />;
};
