import classNames from "classnames";
import React, { useContext, useMemo } from "react";
import { TypeReferenceContext, TypeReferenceContextValue } from "./context/TypeReferenceContext";
import styles from "./ControlledEditableTypeReferenceContent.module.scss";
import { useTypeReferenceMouseDownState } from "./useTypeReferenceMouseDownState";

export declare namespace ControlledEditableTypeReferenceContent {
    export type Props = React.PropsWithChildren<{
        isHovering: boolean;
        isPopoverOpen: boolean;
        onMouseOver: (event: React.MouseEvent) => void;
        onMouseOut: () => void;
    }>;
}

export const ControlledEditableTypeReferenceContent: React.FC<ControlledEditableTypeReferenceContent.Props> = ({
    isHovering,
    isPopoverOpen,
    onMouseOut,
    onMouseOver,
    children,
}) => {
    const {
        isHovering: isHoveringOverParent,
        isSelected: isParentSelected,
        isMouseDown: isMousedDownOnParent,
        isDefaultContext: isOutermostTypeReference,
    } = useContext(TypeReferenceContext);

    const { isMouseDown, didMouseDownWhileSelected, onMouseDown } = useTypeReferenceMouseDownState({
        isParentSelected,
    });

    const isClickable = !isPopoverOpen;
    const isEffectivelyHovering = isClickable && (isHoveringOverParent || isHovering);
    const isMouseEffectivelyDown = isEffectivelyHovering && (isMousedDownOnParent || isMouseDown);
    const isEffectivelySelected =
        isParentSelected || isPopoverOpen || (isEffectivelyHovering && didMouseDownWhileSelected);

    const contextValue = useMemo(
        (): TypeReferenceContextValue => ({
            isSelected: isEffectivelySelected,
            isHovering: isEffectivelyHovering,
            isMouseDown: isMouseEffectivelyDown,
            isDefaultContext: false,
        }),
        [isEffectivelySelected, isEffectivelyHovering, isMouseEffectivelyDown]
    );

    return (
        <TypeReferenceContext.Provider value={contextValue}>
            <div
                onMouseOut={onMouseOut}
                onMouseDown={onMouseDown}
                onMouseOver={onMouseOver}
                className={classNames(styles.container, {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    [styles.horizontalPadding!]: isOutermostTypeReference,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    [styles.hovered!]: isEffectivelyHovering,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    [styles.selected!]: isEffectivelySelected,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    [styles.clickable!]: isClickable,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    [styles.active!]: isMouseEffectivelyDown,
                })}
            >
                {children}
            </div>
        </TypeReferenceContext.Provider>
    );
};
