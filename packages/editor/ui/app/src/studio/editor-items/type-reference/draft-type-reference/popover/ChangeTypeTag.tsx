import { Intent, Tag } from "@blueprintjs/core";
import { useMemo } from "react";
import { useDraftTypeReferenceContext } from "../context/DraftTypeReferenceContext";
import { DraftTypeReferenceTree } from "../tree/DraftTypeReferenceTree";

export declare namespace ChangeTypeTag {
    export interface Props {
        label: string;
        isSelected: boolean;
        generateTree: () => DraftTypeReferenceTree;
        intent?: Intent;
    }
}

export const ChangeTypeTag: React.FC<ChangeTypeTag.Props> = ({ label, isSelected, generateTree, intent }) => {
    const { replaceSelectedNode, onClickNext } = useDraftTypeReferenceContext();

    const onClick = useMemo(() => {
        if (isSelected) {
            return onClickNext;
        }
        return () => {
            replaceSelectedNode(generateTree());
        };
    }, [generateTree, isSelected, onClickNext, replaceSelectedNode]);

    return (
        <Tag
            onClick={onClick}
            minimal={!isSelected}
            interactive
            intent={intent ?? (isSelected ? Intent.PRIMARY : undefined)}
            large
        >
            {label}
        </Tag>
    );
};
