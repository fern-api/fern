import { IconNames } from "@blueprintjs/icons";
import React, { useCallback, useContext, useMemo } from "react";
import { useSidebarItemState } from "../context/useSidebarContext";
import styles from "./CollapsibleSidebarItemRow.module.scss";
import { SidebarItemRow } from "./SidebarItemRow";
import { SidebarItemRowButton } from "./SidebarItemRowButton";
import { SidebarItemRowContext, SidebarItemRowContextValue } from "./SidebarItemRowContext";

export declare namespace CollapsibleSidebarItemRow {
    export interface Props extends Omit<SidebarItemRow.Props, "labelTagContent" | "leftElement"> {
        defaultIsCollapsed: boolean;
        children: React.ReactNode;
    }
}

export const CollapsibleSidebarItemRow: React.FC<CollapsibleSidebarItemRow.Props> = ({
    defaultIsCollapsed,
    children,
    ...rowProps
}) => {
    const [state, setState] = useSidebarItemState(rowProps.itemId, { isCollapsed: defaultIsCollapsed });

    const toggleCollapsed = useCallback(() => {
        setState({
            ...state,
            isCollapsed: !state.isCollapsed,
        });
    }, [setState, state]);

    const inheritedRowContext = useContext(SidebarItemRowContext);
    const rowContext = useMemo(
        (): SidebarItemRowContextValue => ({
            ...inheritedRowContext,
            // so the caret lines up with other non-collapsible items
            // at the same level
            indent: Math.max(0, inheritedRowContext.indent - 8),
        }),
        [inheritedRowContext]
    );
    const childrenRowContext = useMemo(
        (): SidebarItemRowContextValue => ({
            ...rowContext,
            indent: rowContext.indent + 29,
        }),
        [rowContext]
    );

    return (
        <>
            <SidebarItemRowContext.Provider value={rowContext}>
                <SidebarItemRow
                    {...rowProps}
                    leftElement={
                        <SidebarItemRowButton
                            icon={state.isCollapsed ? IconNames.CHEVRON_RIGHT : IconNames.CHEVRON_DOWN}
                            onClick={toggleCollapsed}
                        />
                    }
                />
            </SidebarItemRowContext.Provider>
            <SidebarItemRowContext.Provider value={childrenRowContext}>
                {state.isCollapsed || <div className={styles.children}>{children}</div>}
            </SidebarItemRowContext.Provider>
        </>
    );
};
