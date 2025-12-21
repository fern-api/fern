import { docsYml } from "@fern-api/configuration-loader";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { kebabCase } from "lodash-es";

import { NodeIdGenerator } from "../NodeIdGenerator";
import { toRelativeFilepath } from "./toRelativeFilepath";

/**
 * Resolves a ThemedIcon to a single icon value for use with FDR SDK types.
 * If a themed icon is provided, prefers the light icon, then dark.
 * This is a compatibility layer since FDR SDK types don't support themed icons yet.
 */
function resolveThemedIconToSingleValue(
    themedIcon: docsYml.ThemedIcon | undefined
): string | AbsoluteFilePath | undefined {
    if (themedIcon == null) {
        return undefined;
    }

    // Prefer light icon, then dark
    return themedIcon.light ?? themedIcon.dark;
}

export function toPageNode({
    docsWorkspace,
    page,
    parentSlug,
    idgen,
    markdownFilesToFullSlugs,
    markdownFilesToNoIndex,
    hideChildren,
    resolveIconFileId
}: {
    docsWorkspace: DocsWorkspace;
    page: docsYml.DocsNavigationItem.Page;
    parentSlug: FernNavigation.V1.SlugGenerator;
    idgen: NodeIdGenerator;
    markdownFilesToFullSlugs: Map<AbsoluteFilePath, string>;
    markdownFilesToNoIndex: Map<AbsoluteFilePath, boolean>;
    hideChildren?: boolean;
    resolveIconFileId?: (themedIcon: docsYml.ThemedIcon | undefined) => FernNavigation.V1.FileId | string | undefined;
}): FernNavigation.V1.PageNode {
    const pageId = FernNavigation.V1.PageId(toRelativeFilepath(docsWorkspace, page.absolutePath));
    const pageSlug = parentSlug.apply({
        fullSlug: markdownFilesToFullSlugs.get(page.absolutePath)?.split("/"),
        urlSlug: page.slug ?? kebabCase(page.title)
    });
    // Resolve the icon - use the provided resolver if available, otherwise extract single value from themed icon
    const resolvedIcon = resolveIconFileId ? resolveIconFileId(page.icon) : resolveThemedIconToSingleValue(page.icon);
    return {
        id: idgen.get(pageId),
        type: "page",
        pageId,
        title: page.title,
        slug: pageSlug.get(),
        icon: resolvedIcon,
        hidden: hideChildren || page.hidden,
        noindex: page.noindex || markdownFilesToNoIndex.get(page.absolutePath),
        authed: undefined,
        viewers: page.viewers,
        orphaned: page.orphaned,
        featureFlags: page.featureFlags,
        availability: page.availability
    };
}
