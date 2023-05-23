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
    const firstItem = items[0];
    if (firstItem != null) {
        switch (firstItem.type) {
            case "page":
            case "api":
                return <Navigate to={joinUrlSlugs(slug, firstItem.urlSlug)} replace />;
            case "section":
                return (
                    <RedirectToFirstNavigationItem
                        items={firstItem.items}
                        slug={joinUrlSlugs(slug, firstItem.urlSlug)}
                    />
                );
            default:
                assertVoid(firstItem.type);
        }
    }
    return <NonIdealState title="No content" />;
};

function assertVoid(_: void): void {
    // no-op
}
