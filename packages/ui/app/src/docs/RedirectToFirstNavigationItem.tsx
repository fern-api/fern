import { NonIdealState } from "@blueprintjs/core";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { Navigate } from "react-router-dom";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";

export declare namespace RedirectToFirstNavigationItem {
    export interface Props {
        items: FernRegistryDocsRead.NavigationItem[];
        slug: string;
    }
}

export const RedirectToFirstNavigationItem: React.FC<RedirectToFirstNavigationItem.Props> = ({ items, slug }) => {
    const urlSlug = items[0]?._visit({
        page: (page) => page.urlSlug,
        section: (section) => section.urlSlug,
        api: (api) => api.urlSlug,
        _other: () => undefined,
    });
    if (urlSlug != null) {
        return <Navigate to={joinUrlSlugs(slug, urlSlug)} replace />;
    } else {
        return <NonIdealState title="No content" />;
    }
};
