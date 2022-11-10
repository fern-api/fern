import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { DraftTypeReferenceNodeId } from "./DraftTypeReferenceNodeId";
import { DraftTypeReferenceTree } from "./DraftTypeReferenceTree";

export type DraftTypeReference =
    | DraftTypeReference.NamedType
    | DraftTypeReference.ContainerType
    | DraftTypeReference.PrimitiveType
    | DraftTypeReference.UnknownType
    | DraftTypeReference.Placeholder;

export declare namespace DraftTypeReference {
    export interface NamedType extends BaseDraftTypeReference {
        type: "named";
        typeId: FernApiEditor.TypeId;
    }

    export type ContainerType = MapType | ListType | SetType | OptionalType | LiteralType;

    export interface MapType extends BaseDraftTypeReference {
        type: "map";
        keyType: DraftTypeReferenceNodeId;
        valueType: DraftTypeReferenceNodeId;
    }

    export interface ListType extends BaseDraftTypeReference {
        type: "list";
        itemType: DraftTypeReferenceNodeId;
    }

    export interface SetType extends BaseDraftTypeReference {
        type: "set";
        itemType: DraftTypeReferenceNodeId;
    }

    export interface OptionalType extends BaseDraftTypeReference {
        type: "optional";
        itemType: DraftTypeReferenceNodeId;
    }

    export interface LiteralType extends BaseDraftTypeReference {
        type: "literal";
        literal: FernApiEditor.Literal;
    }

    export interface PrimitiveType extends BaseDraftTypeReference {
        type: "primitive";
        primitive: FernApiEditor.PrimitiveType;
    }

    export interface UnknownType extends BaseDraftTypeReference {
        type: "unknown";
    }

    export interface Placeholder extends BaseDraftTypeReference {
        type: "placeholder";
        label: string;
    }
}

export interface BaseDraftTypeReference {
    id: DraftTypeReferenceNodeId;
    parent: DraftTypeReferenceNodeId | undefined;
}

export const DraftTypeReference = {
    map: (): DraftTypeReferenceTree => {
        const mapId = DraftTypeReferenceNodeId.generate();

        const keyType: DraftTypeReference.Placeholder = {
            type: "placeholder",
            label: "key",
            id: DraftTypeReferenceNodeId.generate(),
            parent: mapId,
        };

        const valueType: DraftTypeReference.Placeholder = {
            type: "placeholder",
            label: "value",
            id: DraftTypeReferenceNodeId.generate(),
            parent: mapId,
        };

        return {
            root: mapId,
            nodes: {
                [mapId]: {
                    type: "map",
                    id: mapId,
                    keyType: keyType.id,
                    valueType: valueType.id,
                    parent: undefined,
                },
                [keyType.id]: keyType,
                [valueType.id]: valueType,
            },
        };
    },

    list: (): DraftTypeReferenceTree => {
        const listId = DraftTypeReferenceNodeId.generate();

        const itemType: DraftTypeReference.Placeholder = {
            type: "placeholder",
            label: "item",
            id: DraftTypeReferenceNodeId.generate(),
            parent: listId,
        };

        return {
            root: listId,
            nodes: {
                [listId]: {
                    type: "list",
                    id: listId,
                    itemType: itemType.id,
                    parent: undefined,
                },
                [itemType.id]: itemType,
            },
        };
    },

    set: (): DraftTypeReferenceTree => {
        const setId = DraftTypeReferenceNodeId.generate();

        const itemType: DraftTypeReference.Placeholder = {
            type: "placeholder",
            label: "item",
            id: DraftTypeReferenceNodeId.generate(),
            parent: setId,
        };

        return {
            root: setId,
            nodes: {
                [setId]: {
                    type: "set",
                    id: setId,
                    itemType: itemType.id,
                    parent: undefined,
                },
                [itemType.id]: itemType,
            },
        };
    },

    optional: (): DraftTypeReferenceTree => {
        const optionalId = DraftTypeReferenceNodeId.generate();

        const itemType: DraftTypeReference.Placeholder = {
            type: "placeholder",
            label: "item",
            id: DraftTypeReferenceNodeId.generate(),
            parent: optionalId,
        };

        return {
            root: optionalId,
            nodes: {
                [optionalId]: {
                    type: "optional",
                    id: optionalId,
                    itemType: itemType.id,
                    parent: undefined,
                },
                [itemType.id]: itemType,
            },
        };
    },

    primitive: (primitive: FernApiEditor.PrimitiveType): DraftTypeReferenceTree => {
        const node: DraftTypeReference.PrimitiveType = {
            type: "primitive",
            id: DraftTypeReferenceNodeId.generate(),
            primitive,
            parent: undefined,
        };
        return {
            root: node.id,
            nodes: {
                [node.id]: node,
            },
        };
    },

    named: (typeId: FernApiEditor.TypeId): DraftTypeReferenceTree => {
        const node: DraftTypeReference.NamedType = {
            type: "named",
            id: DraftTypeReferenceNodeId.generate(),
            typeId,
            parent: undefined,
        };
        return {
            root: node.id,
            nodes: {
                [node.id]: node,
            },
        };
    },

    unknown: (): DraftTypeReferenceTree => {
        const node: DraftTypeReference.UnknownType = {
            type: "unknown",
            id: DraftTypeReferenceNodeId.generate(),
            parent: undefined,
        };
        return {
            root: node.id,
            nodes: {
                [node.id]: node,
            },
        };
    },
};
