import { Intent } from "@blueprintjs/core";
import { useDraftTypeReferenceContext } from "../context/DraftTypeReferenceContext";
import { DraftTypeReference } from "../tree/DraftTypeReference";
import { ChangeTypeTag } from "./ChangeTypeTag";

export const UnknownTag: React.FC = () => {
    const { selectedNode } = useDraftTypeReferenceContext();
    const isSelected = selectedNode.type === "unknown";

    return (
        <ChangeTypeTag
            label="unknown"
            isSelected={isSelected}
            generateTree={DraftTypeReference.unknown}
            intent={Intent.WARNING}
        />
    );
};
