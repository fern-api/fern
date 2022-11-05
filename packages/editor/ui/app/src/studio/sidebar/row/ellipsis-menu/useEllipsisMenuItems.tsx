import { Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useMemo } from "react";
import { SidebarItemMenuItem } from "../menu-item/SidebarItemMenuItem";

export declare namespace useEllipsisMenuItems {
    export interface Args {
        startRenaming?: () => void;
        onDelete?: () => void;
    }
}

export function useEllipsisMenuItems({ startRenaming, onDelete }: useEllipsisMenuItems.Args): JSX.Element[] {
    return useMemo(() => {
        const items: JSX.Element[] = [];
        if (startRenaming != null) {
            items.push(
                <SidebarItemMenuItem key="rename" text="Rename" icon={IconNames.EDIT} onClick={startRenaming} />
            );
        }
        if (onDelete != null) {
            items.push(
                <SidebarItemMenuItem
                    key="delete"
                    text="Delete..."
                    icon={IconNames.TRASH}
                    intent={Intent.DANGER}
                    onClick={onDelete}
                />
            );
        }
        return items;
    }, [onDelete, startRenaming]);
}
