import { useDraftTypeReferenceContext } from "../context/DraftTypeReferenceContext";
import { DraftTypeReference } from "../tree/DraftTypeReference";
import { ChangeTypeTag } from "./ChangeTypeTag";

export const OptionalTag: React.FC = () => {
    const { selectedNode } = useDraftTypeReferenceContext();
    const isSelected = selectedNode.type === "optional";

    return <ChangeTypeTag label="optional" isSelected={isSelected} generateTree={DraftTypeReference.optional} />;
};
