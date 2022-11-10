import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { DraftTypeReferenceNode } from "../tree/DraftTypeReferenceNode";
import { DraftTypeReferenceNodeId } from "../tree/DraftTypeReferenceNodeId";
import { DraftTypeReferenceTree } from "../tree/DraftTypeReferenceTree";

export function convertTypeReferenceToDraftTree(
    typeReference: FernApiEditor.TypeReference,
    parent?: DraftTypeReferenceNodeId
): DraftTypeReferenceTree {
    return typeReference._visit<DraftTypeReferenceTree>({
        container: (container) =>
            container._visit<DraftTypeReferenceTree>({
                map: ({ keyType, valueType }) => {
                    const mapId = DraftTypeReferenceNodeId.generate();

                    const draftKeyType = convertTypeReferenceToDraftTree(keyType, mapId);
                    const draftValueType = convertTypeReferenceToDraftTree(valueType, mapId);

                    const root: DraftTypeReferenceNode = {
                        type: "map",
                        id: mapId,
                        keyType: draftKeyType.root,
                        valueType: draftValueType.root,
                        parent,
                    };

                    return {
                        root: root.id,
                        nodes: {
                            ...draftKeyType.nodes,
                            ...draftValueType.nodes,
                            [root.id]: root,
                        },
                    };
                },
                list: (itemType) => {
                    const listId = DraftTypeReferenceNodeId.generate();

                    const draftItemType = convertTypeReferenceToDraftTree(itemType, listId);

                    const root: DraftTypeReferenceNode = {
                        type: "list",
                        id: listId,
                        itemType: draftItemType.root,
                        parent,
                    };

                    return {
                        root: root.id,
                        nodes: {
                            ...draftItemType.nodes,
                            [root.id]: root,
                        },
                    };
                },
                set: (itemType) => {
                    const setId = DraftTypeReferenceNodeId.generate();

                    const draftItemType = convertTypeReferenceToDraftTree(itemType, setId);

                    const root: DraftTypeReferenceNode = {
                        type: "set",
                        id: setId,
                        itemType: draftItemType.root,
                        parent,
                    };

                    return {
                        root: root.id,
                        nodes: {
                            ...draftItemType.nodes,
                            [root.id]: root,
                        },
                    };
                },
                optional: (itemType) => {
                    const optionalId = DraftTypeReferenceNodeId.generate();

                    const draftItemType = convertTypeReferenceToDraftTree(itemType, optionalId);

                    const root: DraftTypeReferenceNode = {
                        type: "optional",
                        id: optionalId,
                        itemType: draftItemType.root,
                        parent,
                    };

                    return {
                        root: root.id,
                        nodes: {
                            ...draftItemType.nodes,
                            [root.id]: root,
                        },
                    };
                },
                literal: (literal) => {
                    const rootId = DraftTypeReferenceNodeId.generate();
                    return {
                        root: rootId,
                        nodes: {
                            [rootId]: {
                                type: "literal",
                                id: rootId,
                                literal,
                                parent,
                            },
                        },
                    };
                },
                _other: ({ type }) => {
                    throw new Error("Unknown container type: " + type);
                },
            }),
        named: (typeId) => DraftTypeReferenceNode.named(typeId, { parent }),
        primitive: (primitive) => DraftTypeReferenceNode.primitive(primitive, { parent }),
        unknown: () => DraftTypeReferenceNode.unknown({ parent }),
        _other: ({ type }) => {
            throw new Error("Unknown TypeReference type: " + type);
        },
    });
}
