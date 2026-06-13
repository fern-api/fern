import {
    applyTranslatedFrontmatterToNavTree,
    applyTranslatedNavigationOverlays,
    type DocsDefinitionResolver,
    getTranslatedAnnouncement,
    replaceImagePathsAndUrls,
    replaceReferencedCode,
    replaceReferencedMarkdown,
    stripMdxComments,
    transformAtPrefixImports
} from "@fern-api/docs-resolver";
import type { DocsV1Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, doesPathExist, RelativeFilePath, relative, resolve } from "@fern-api/fs-utils";
import type { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";

type DocsDefinition = DocsV1Write.DocsDefinition;

/**
 * Build a translated DocsDefinition by overlaying translated pages and
 * navigation on top of the base definition. Applies the full MDX processing
 * pipeline shared by both the V2 and ledger translation paths:
 *
 *  1. Locale-aware snippet resolution (prefers translated snippets)
 *  2. `<Code src="..."/>` reference resolution
 *  3. `@/` import transforms
 *  4. MDX comment stripping
 *  5. Image path rewrites (using base page location)
 *  6. `editThisPageUrl` rewriting to point to the translated file
 *  7. Nav tree overlay (translated sidebar titles from frontmatter + docs.yml)
 *  8. Translated announcement and navbar links
 */
export async function buildTranslatedDocsDefinition({
    docsDefinition,
    locale,
    localePages,
    translationNavigationOverlays,
    resolver,
    context
}: {
    docsDefinition: DocsDefinition;
    locale: string;
    localePages: Record<string, string>;
    translationNavigationOverlays:
        | Record<string, import("@fern-api/configuration").docsYml.TranslationNavigationOverlay>
        | undefined;
    resolver: DocsDefinitionResolver;
    context: TaskContext;
}): Promise<DocsDefinition> {
    const collectedFileIds = resolver.getCollectedFileIds();
    const docsWorkspacePath = resolver.getDocsWorkspacePath();

    const resolveLocalePath = async (filepath: AbsoluteFilePath): Promise<AbsoluteFilePath> => {
        const relPath = relative(docsWorkspacePath, filepath);
        const translatedPath = resolve(docsWorkspacePath, RelativeFilePath.of(`translations/${locale}/${relPath}`));
        return (await doesPathExist(translatedPath)) ? translatedPath : filepath;
    };

    const localeAwareMarkdownLoader = async (filepath: AbsoluteFilePath): Promise<string> => {
        const pathToRead = await resolveLocalePath(filepath);
        const raw = await readFile(pathToRead, "utf-8");
        const fmMatch = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
        return fmMatch != null ? raw.slice(fmMatch[0].length) : raw;
    };

    const localeAwareFileLoader = async (filepath: AbsoluteFilePath): Promise<string> => {
        const pathToRead = await resolveLocalePath(filepath);
        return readFile(pathToRead, "utf-8");
    };

    const translatedPageEntries = await Promise.all(
        Object.entries(localePages).map(async ([path, rawMarkdown]) => {
            try {
                const basePage = docsDefinition.pages[path as DocsV1Write.PageId];
                const absolutePathToMarkdownFile = resolve(docsWorkspacePath, RelativeFilePath.of(path));

                const { markdown: markdownResolved } = await replaceReferencedMarkdown({
                    markdown: rawMarkdown,
                    absolutePathToFernFolder: docsWorkspacePath,
                    absolutePathToMarkdownFile,
                    context,
                    markdownLoader: localeAwareMarkdownLoader
                });

                const codeResolved = await replaceReferencedCode({
                    markdown: markdownResolved,
                    absolutePathToFernFolder: docsWorkspacePath,
                    absolutePathToMarkdownFile,
                    context,
                    fileLoader: localeAwareFileLoader
                });

                const importsResolved = transformAtPrefixImports({
                    markdown: codeResolved,
                    absolutePathToFernFolder: docsWorkspacePath,
                    absolutePathToMarkdownFile
                });

                let processedMarkdown = stripMdxComments(importsResolved);

                processedMarkdown = replaceImagePathsAndUrls(
                    processedMarkdown,
                    collectedFileIds,
                    {},
                    {
                        absolutePathToMarkdownFile,
                        absolutePathToFernFolder: docsWorkspacePath
                    },
                    context
                );

                let editThisPageUrl = basePage?.editThisPageUrl;
                if (editThisPageUrl != null) {
                    const fernPathPattern = `/fern/${path}`;
                    const translatedPathStr = `/fern/translations/${locale}/${path}`;
                    editThisPageUrl = editThisPageUrl.replace(
                        fernPathPattern,
                        translatedPathStr
                    ) as typeof editThisPageUrl;
                }

                return [
                    path,
                    {
                        markdown: processedMarkdown,
                        rawMarkdown: processedMarkdown,
                        editThisPageUrl,
                        editThisPageLaunch: basePage?.editThisPageLaunch
                    }
                ];
            } catch (pageError) {
                context.logger.warn(
                    `Failed to process translated page "${path}" for locale "${locale}": ${String(pageError)}. Falling back to base page.`
                );
                return undefined;
            }
        })
    );

    const translatedPages = {
        ...docsDefinition.pages,
        ...Object.fromEntries(
            translatedPageEntries.filter((entry): entry is NonNullable<typeof entry> => entry != null)
        )
    };

    let updatedRoot = applyTranslatedFrontmatterToNavTree(
        docsDefinition.config.root,
        localePages as Record<string, string>,
        context
    );

    const localeNavOverlay = translationNavigationOverlays?.[locale];
    let translatedAnnouncement = docsDefinition.config.announcement;
    let translatedNavbarLinks = docsDefinition.config.navbarLinks;
    if (localeNavOverlay != null) {
        updatedRoot = applyTranslatedNavigationOverlays(updatedRoot, localeNavOverlay);
        translatedAnnouncement = getTranslatedAnnouncement(localeNavOverlay) ?? translatedAnnouncement;
        if (localeNavOverlay.navbarLinks != null) {
            translatedNavbarLinks = localeNavOverlay.navbarLinks;
        }
    }

    return {
        ...docsDefinition,
        pages: translatedPages,
        config: {
            ...docsDefinition.config,
            root: updatedRoot,
            announcement: translatedAnnouncement,
            navbarLinks: translatedNavbarLinks
        }
    };
}
