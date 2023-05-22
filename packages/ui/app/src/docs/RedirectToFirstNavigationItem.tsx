import { NonIdealState } from "@blueprintjs/core";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { Navigate } from "react-router-dom";

export declare namespace RedirectToFirstNavigationItem {
    export interface Props {
        items: FernRegistryDocsRead.NavigationItem[];
    }
}

export const RedirectToFirstNavigationItem: React.FC<RedirectToFirstNavigationItem.Props> = ({ items }) => {
    const urlSlug = items[0]?._visit({
        page: (page) => page.urlSlug,
        section: (section) => section.urlSlug,
        api: (api) => api.urlSlug,
        _other: () => undefined,
    });
    if (urlSlug != null) {
        return <Navigate to={urlSlug} replace />;
    } else {
        return <NonIdealState title="No content" />;
    }
};
