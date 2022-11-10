import { assertNever } from "@fern-api/core-utils";
import { DraftList } from "./container/DraftList";
import { DraftMap } from "./container/DraftMap";
import { DraftOptional } from "./container/DraftOptional";
import { DraftSet } from "./container/DraftSet";
import { useDraftTypeReferenceContext } from "./context/DraftTypeReferenceContext";
import { DraftLiteral } from "./literal/DraftLiteral";
import { DraftNamed } from "./named/DraftNamedType";
import { DraftPlaceholder } from "./placeholder/DraftPlaceholder";
import { DraftPrimitive } from "./primitive/DraftPrimitive";
import { DraftTypeReferenceNodeId } from "./tree/DraftTypeReferenceNodeId";
import { DraftUnknown } from "./unknown/DraftUnknown";

export declare namespace DraftTypeReferenceContent {
    export interface Props {
        nodeId: DraftTypeReferenceNodeId;
    }
}

export const DraftTypeReferenceContent: React.FC<DraftTypeReferenceContent.Props> = ({ nodeId }) => {
    const { getNode } = useDraftTypeReferenceContext();
    const node = getNode(nodeId);

    switch (node.type) {
        case "list":
            return <DraftList node={node} />;
        case "primitive":
            return <DraftPrimitive node={node} />;
        case "map":
            return <DraftMap node={node} />;
        case "set":
            return <DraftSet node={node} />;
        case "optional":
            return <DraftOptional node={node} />;
        case "named":
            return <DraftNamed node={node} />;
        case "literal":
            return <DraftLiteral node={node} />;
        case "unknown":
            return <DraftUnknown node={node} />;
        case "placeholder":
            return <DraftPlaceholder node={node} />;
        default:
            assertNever(node);
    }
};
