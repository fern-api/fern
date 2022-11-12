import { ReactElement, useMemo } from "react";

export declare namespace MaybeDraftContainingList {
    export interface Props<Item> {
        items: readonly Item[];
        draft: Item | undefined;
        renderItem: (item: Item, args: { isDraft: boolean }) => JSX.Element;
    }
}

export function MaybeDraftContainingList<Item>({
    items,
    draft,
    renderItem,
}: MaybeDraftContainingList.Props<Item>): ReactElement {
    // we put the items all in an array together, so that React gracefully
    // handles when an item turns from draft to persisted
    const packagesList = useMemo(() => {
        const elements = items.map((item) => renderItem(item, { isDraft: false }));
        if (draft != null) {
            elements.push(renderItem(draft, { isDraft: true }));
        }
        return elements;
    }, [draft, items, renderItem]);

    return <>{packagesList}</>;
}
