import { useDraftTypeReferenceContext } from "../context/DraftTypeReferenceContext";
import { DraftTypeReferenceNode } from "../tree/DraftTypeReferenceNode";
import { ChangeTypeTag } from "./ChangeTypeTag";

export const MapTag: React.FC = () => {
    const { selectedNode } = useDraftTypeReferenceContext();
    const isSelected = selectedNode.type === "map";

    return <ChangeTypeTag label="map" isSelected={isSelected} generateTree={DraftTypeReferenceNode.map} />;
};
