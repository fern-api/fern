import { useContext, useMemo } from "react";
import {
    JsonExampleBreadcumbsContext,
    JsonExampleBreadcumbsContextValue,
} from "./contexts/JsonExampleBreadcumbsContext";
import { JsonItemBottomLine } from "./JsonItemBottomLine";
import { JsonItemMiddleLines } from "./JsonItemMiddleLines";
import { JsonItemTopLine } from "./JsonItemTopLine";

export interface JsonListItem {
    list: unknown[];
    index: number;
    item: unknown;
    isLastItem: boolean;
}

export const JsonListItem: React.FC<JsonListItem> = ({ list, index, item, isLastItem }) => {
    const { breadcrumbs } = useContext(JsonExampleBreadcumbsContext);
    const contextValue = useMemo(
        (): JsonExampleBreadcumbsContextValue => ({
            breadcrumbs: [
                ...breadcrumbs,
                {
                    type: "listItem",
                    list,
                    index,
                },
            ],
        }),
        [breadcrumbs, index, list]
    );

    return (
        <div>
            <JsonItemTopLine value={item} isNonLastItemInCollection={!isLastItem} />
            <JsonExampleBreadcumbsContext.Provider value={contextValue}>
                <JsonItemMiddleLines value={item} />
            </JsonExampleBreadcumbsContext.Provider>
            <JsonItemBottomLine value={item} isNonLastItemInCollection={!isLastItem} />
        </div>
    );
};
