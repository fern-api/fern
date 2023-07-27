import { NonIdealState } from "@blueprintjs/core";
import { assertNeverNoThrow } from "@fern-api/core-utils";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { useDocsContext } from "../docs-context/useDocsContext";
import { Redirect } from "./Redirect";

export declare namespace RedirectToFirstNavigationItem {
    export interface Props {
        items: FernRegistryDocsRead.NavigationItem[];
        slug: string;
    }
}

export const RedirectToFirstNavigationItem: React.FC<RedirectToFirstNavigationItem.Props> = ({ items, slug }) => {
    const { getFullSlug } = useDocsContext();
    const firstItem = items[0];
    if (firstItem != null) {
        switch (firstItem.type) {
            case "page":
            case "api":
                return <Redirect to={getFullSlug(joinUrlSlugs(slug, firstItem.urlSlug))} replace />;
            case "section":
                return (
                    <RedirectToFirstNavigationItem
                        items={firstItem.items}
                        slug={joinUrlSlugs(slug, firstItem.urlSlug)}
                    />
                );
            default:
                assertNeverNoThrow(firstItem);
        }
    }
    return <NonIdealState title="No content" />;
};
