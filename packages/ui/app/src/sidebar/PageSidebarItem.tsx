import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { useMemo } from "react";
import { ResolvedUrlPath } from "../docs-context/url-path-resolver/UrlPathResolver";
import { NavigatingSidebarItem } from "./NavigatingSidebarItem";

export declare namespace PageSidebarItem {
    export interface Props {
        slug: string;
        pageMetadata: FernRegistryDocsRead.PageMetadata;
    }
}

export const PageSidebarItem: React.FC<PageSidebarItem.Props> = ({ slug, pageMetadata }) => {
    const path = useMemo(
        (): ResolvedUrlPath.Page => ({
            type: "page",
            page: pageMetadata,
            slug,
        }),
        [pageMetadata, slug]
    );

    return <NavigatingSidebarItem path={path} title={pageMetadata.title} />;
};
