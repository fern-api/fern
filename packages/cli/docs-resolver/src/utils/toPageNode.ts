import { kebabCase } from "lodash-es"

import { docsYml } from "@fern-api/configuration-loader"
import { FernNavigation } from "@fern-api/fdr-sdk"
import { AbsoluteFilePath } from "@fern-api/fs-utils"
import { DocsWorkspace } from "@fern-api/workspace-loader"

import { NodeIdGenerator } from "../NodeIdGenerator"
import { toRelativeFilepath } from "./toRelativeFilepath"

export function toPageNode({
    docsWorkspace,
    page,
    parentSlug,
    idgen,
    markdownFilesToFullSlugs,
    markdownFilesToNoIndex,
    hideChildren
}: {
    docsWorkspace: DocsWorkspace
    page: docsYml.DocsNavigationItem.Page
    parentSlug: FernNavigation.V1.SlugGenerator
    idgen: NodeIdGenerator
    markdownFilesToFullSlugs: Map<AbsoluteFilePath, string>
    markdownFilesToNoIndex: Map<AbsoluteFilePath, boolean>
    hideChildren?: boolean
}): FernNavigation.V1.PageNode {
    const pageId = FernNavigation.V1.PageId(toRelativeFilepath(docsWorkspace, page.absolutePath))
    const pageSlug = parentSlug.apply({
        fullSlug: markdownFilesToFullSlugs.get(page.absolutePath)?.split("/"),
        urlSlug: page.slug ?? kebabCase(page.title)
    })
    return {
        id: idgen.get(pageId),
        type: "page",
        pageId,
        title: page.title,
        slug: pageSlug.get(),
        icon: page.icon,
        hidden: hideChildren || page.hidden,
        noindex: page.noindex || markdownFilesToNoIndex.get(page.absolutePath),
        authed: undefined,
        viewers: page.viewers,
        orphaned: page.orphaned,
        featureFlags: page.featureFlags
    }
}
