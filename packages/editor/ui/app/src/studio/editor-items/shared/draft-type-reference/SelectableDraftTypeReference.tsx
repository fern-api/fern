import { useIsDirectlyHovering } from "@fern-ui/react-commons";
import classNames from "classnames";
import React, { useCallback } from "react";
import { useDraftTypeReferenceContext } from "./context/DraftTypeReferenceContext";
import styles from "./SelectableDraftTypeReference.module.scss";
import { DraftTypeReferenceNodeId } from "./tree/DraftTypeReferenceNodeId";

export declare namespace SelectableDraftTypeReference {
    export interface Props {
        nodeId: DraftTypeReferenceNodeId;
        className?: string;
        isContainer?: boolean;
        children: JSX.Element | JSX.Element[];
    }
}

export const SelectableDraftTypeReference: React.FC<SelectableDraftTypeReference.Props> = ({
    nodeId,
    isContainer = false,
    className,
    children,
}) => {
    const { selectedNode, setSelectedNodeId, invalidNodeId } = useDraftTypeReferenceContext();
    const isSelected = selectedNode.id === nodeId;
    const isInvalid = invalidNodeId === nodeId;
    const { isHovering, onMouseOut, onMouseOver } = useIsDirectlyHovering();

    const onClick = useCallback(
        (event: React.MouseEvent) => {
            setSelectedNodeId(nodeId);
            // so we don't select outer types
            event.stopPropagation();
        },
        [nodeId, setSelectedNodeId]
    );

    return (
        <div
            className={classNames(styles.container, className, {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [styles.selected!]: isSelected,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [styles.hovering!]: isHovering,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [styles.invalid!]: isInvalid,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [styles.primitive!]: !isContainer,
            })}
            onClick={onClick}
            onMouseOut={onMouseOut}
            onMouseOver={onMouseOver}
        >
            {children}
        </div>
    );
};
