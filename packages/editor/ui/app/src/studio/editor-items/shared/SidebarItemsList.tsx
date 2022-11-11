import { ReactElement, useMemo } from "react";
import { useSidebarContext } from "../../sidebar/context/useSidebarContext";
import { DraftSidebarItemId } from "../../sidebar/drafts/DraftSidebarItemId";
import { MaybeDraftContainingList } from "./MaybeDraftContainingList";

export declare namespace SidebarItemsList {
    export interface Props<Item, DraftId extends DraftSidebarItemId> {
        items: readonly Item[];
        renderItem: (item: Item) => JSX.Element;
        parseDraftId: (draft: DraftSidebarItemId) => DraftId | undefined;
        doesDraftBelongInList: (draft: DraftId) => boolean;
        convertDraftToItem: (draft: DraftId) => Item | undefined;
    }
}

export function SidebarItemsList<Item, DraftId extends DraftSidebarItemId>({
    items,
    renderItem,
    parseDraftId,
    doesDraftBelongInList,
    convertDraftToItem,
}: SidebarItemsList.Props<Item, DraftId>): ReactElement {
    const { draft } = useSidebarContext();

    const draftItem = useMemo(() => {
        if (draft != null) {
            const parsedDraftId = parseDraftId(draft);
            if (parsedDraftId != null && doesDraftBelongInList(parsedDraftId)) {
                return convertDraftToItem(parsedDraftId);
            }
        }
        return undefined;
    }, [convertDraftToItem, doesDraftBelongInList, draft, parseDraftId]);

    return <MaybeDraftContainingList items={items} draft={draftItem} renderItem={renderItem} />;
}
