import { IconNames } from "@blueprintjs/icons";
import React, { useCallback, useContext, useMemo } from "react";
import { useSidebarItemState } from "../../context/useSidebarContext";
import { SidebarItemId } from "../../ids/SidebarItemId";
import { SidebarItemRowButton } from "../button/SidebarItemRowButton";
import styles from "./CollapsibleSidebarItemRow.module.scss";
import { CollapsibleSidebarItemRowContext } from "./CollapsibleSidebarItemRowContext";

export declare namespace CollapsibleSidebarItemRow {
    export interface Props {
        itemId: SidebarItemId;
        defaultIsCollapsed: boolean;
        renderRow: (args: { leftElement: JSX.Element }) => JSX.Element;
        children: React.ReactNode;
    }
}

export const CollapsibleSidebarItemRow: React.FC<CollapsibleSidebarItemRow.Props> = ({
    itemId,
    defaultIsCollapsed,
    renderRow,
    children,
}) => {
    const [state, setState] = useSidebarItemState(itemId, { isCollapsed: defaultIsCollapsed });

    const toggleCollapsed = useCallback(() => {
        setState({
            ...state,
            isCollapsed: !state.isCollapsed,
        });
    }, [setState, state]);

    const inheritedContext = useContext(CollapsibleSidebarItemRowContext);
    const rowContext = useMemo(
        (): CollapsibleSidebarItemRowContext => ({
            ...inheritedContext,
            // so the caret lines up with other non-collapsible items
            // at the same level
            indent: Math.max(0, inheritedContext.indent - 8),
        }),
        [inheritedContext]
    );
    const childrenRowContext = useMemo(
        (): CollapsibleSidebarItemRowContext => ({
            ...rowContext,
            indent: rowContext.indent + 29,
        }),
        [rowContext]
    );

    return (
        <>
            <CollapsibleSidebarItemRowContext.Provider value={rowContext}>
                {renderRow({
                    leftElement: (
                        <SidebarItemRowButton
                            className={styles.collapseButton}
                            icon={state.isCollapsed ? IconNames.CHEVRON_RIGHT : IconNames.CHEVRON_DOWN}
                            onClick={toggleCollapsed}
                        />
                    ),
                })}
            </CollapsibleSidebarItemRowContext.Provider>
            <CollapsibleSidebarItemRowContext.Provider value={childrenRowContext}>
                {state.isCollapsed || <div className={styles.children}>{children}</div>}
            </CollapsibleSidebarItemRowContext.Provider>
        </>
    );
};
