import { v4 as uuidv4 } from "uuid";

export type DraftTypeReferenceNodeId = string & {
    __DraftTypeReferenceNodeId: void;
};

export const DraftTypeReferenceNodeId = {
    generate: (): DraftTypeReferenceNodeId => uuidv4() as DraftTypeReferenceNodeId,
};
