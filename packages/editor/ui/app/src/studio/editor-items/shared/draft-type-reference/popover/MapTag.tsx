import { useDraftTypeReferenceContext } from "../context/DraftTypeReferenceContext";
import { DraftTypeReference } from "../tree/DraftTypeReference";
import { ChangeTypeTag } from "./ChangeTypeTag";

export const MapTag: React.FC = () => {
    const { selectedNode } = useDraftTypeReferenceContext();
    const isSelected = selectedNode.type === "map";

    return <ChangeTypeTag label="map" isSelected={isSelected} generateTree={DraftTypeReference.map} />;
};
