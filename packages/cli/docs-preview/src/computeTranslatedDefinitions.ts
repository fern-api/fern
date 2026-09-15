import {
    applyTranslatedApiTitlesToNavTree,
    applyTranslatedFrontmatterToNavTree,
    applyTranslatedNavigationOverlays,
    findIncompatibleTranslatedApiIds,
    getTranslatedAnnouncement,
    replaceImagePathsAndUrls,
    replaceReferencedCode,
    replaceReferencedMarkdown,
    stripMdxComments,
    transformAtPrefixImports
} from "@fern-api/docs-resolver";
import { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, doesPathExist, RelativeFilePath, relative, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import type { PreviewDocsResult } from "./previewDocs.js";

/**
 * Computes translated definitions for each locale.
 * Similar to what publishDocs.ts does for production, but for local preview.
 */
export async function computeTranslatedDefinitions(
    result: PreviewDocsResult,
    context: TaskContext
): Promise<Map<string, DocsV1Read.DocsDefinition>> {
    const translations = new Map<string, DocsV1Read.DocsDefinition>();
    const {
        docsDefinition,
        translationPages,
        translationNavigationOverlays,
        translatedApiDefinitions,
        collectedFileIds,
        docsWorkspacePath,
        markdownFilesToPathName
    } = result;

    const hasTranslatedPages = translationPages != null && Object.keys(translationPages).length > 0;
    const hasTranslatedApis = translatedApiDefinitions != null && Object.keys(translatedApiDefinitions).length > 0;
    if (!hasTranslatedPages && !hasTranslatedApis) {
        return translations;
    }

    const defaultLocale = docsDefinition.config.translations?.defaultLocale;

    // A locale qualifies if it has translated pages, translated API specs, or both.
    const localesToBuild = new Set<string>([
        ...Object.keys(translationPages ?? {}),
        ...Object.keys(translatedApiDefinitions ?? {})
    ]);

    for (const locale of localesToBuild) {
        // Skip the default locale - we use the base definition for that
        if (locale === defaultLocale) {
            continue;
        }

        const localePages = translationPages?.[locale] ?? {};

        try {
            // Locale-aware file loaders that prefer translated snippets when available
            const resolveLocalePath = async (filepath: AbsoluteFilePath): Promise<AbsoluteFilePath> => {
                const relPath = relative(docsWorkspacePath, filepath);
                const translatedPath = resolve(
                    docsWorkspacePath,
                    RelativeFilePath.of(`translations/${locale}/${relPath}`)
                );
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

            // Build translated pages by merging base pages with locale-specific pages
            // Start by copying all defined pages from the base definition
            const translatedPages: Record<string, DocsV1Read.PageContent> = {};
            for (const [pageId, page] of Object.entries(docsDefinition.pages)) {
                if (page != null) {
                    translatedPages[pageId] = page;
                }
            }

            for (const [pagePath, rawMarkdown] of Object.entries(localePages)) {
                try {
                    const basePage = translatedPages[pagePath];
                    const absolutePathToMarkdownFile = resolve(docsWorkspacePath, RelativeFilePath.of(pagePath));

                    // Resolve <Markdown src="..."/> snippets (locale-aware)
                    const { markdown: markdownResolved } = await replaceReferencedMarkdown({
                        markdown: rawMarkdown,
                        absolutePathToFernFolder: docsWorkspacePath,
                        absolutePathToMarkdownFile,
                        context,
                        markdownLoader: localeAwareMarkdownLoader
                    });

                    // Resolve <Code src="..."/> references (locale-aware)
                    const codeResolved = await replaceReferencedCode({
                        markdown: markdownResolved,
                        absolutePathToFernFolder: docsWorkspacePath,
                        absolutePathToMarkdownFile,
                        context,
                        fileLoader: localeAwareFileLoader
                    });

                    // Transform @/ prefix imports to relative paths
                    const importsResolved = transformAtPrefixImports({
                        markdown: codeResolved,
                        absolutePathToFernFolder: docsWorkspacePath,
                        absolutePathToMarkdownFile,
                        context
                    });

                    // Strip MDX comments
                    let processedMarkdown = stripMdxComments(importsResolved);

                    // Replace image paths using collected file IDs
                    processedMarkdown = replaceImagePathsAndUrls(
                        processedMarkdown,
                        collectedFileIds,
                        markdownFilesToPathName,
                        {
                            absolutePathToMarkdownFile,
                            absolutePathToFernFolder: docsWorkspacePath
                        },
                        context
                    );

                    translatedPages[pagePath] = {
                        markdown: processedMarkdown,
                        rawMarkdown: processedMarkdown,
                        editThisPageUrl: basePage?.editThisPageUrl,
                        editThisPageLaunch: basePage?.editThisPageLaunch
                    };
                } catch (pageError) {
                    context.logger.warn(
                        `Failed to process translated page "${pagePath}" for locale "${locale}": ${String(pageError)}. Falling back to base page.`
                    );
                }
            }

            // Apply translated frontmatter to nav tree
            let updatedRoot = applyTranslatedFrontmatterToNavTree(
                docsDefinition.config.root,
                localePages as Record<string, string>,
                context
            );

            // Apply navigation overlay (translated display-names, titles, etc.)
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

            const baseApis = docsDefinition.apis as Record<string, APIV1Read.ApiDefinition>;
            const localeApis = translatedApiDefinitions?.[locale];

            // A translated spec that drifts from the base — most commonly a changed
            // OpenAPI tag name (which derives subpackage/endpoint ids), but also a
            // missing/added endpoint or a changed path — produces an API whose nav
            // nodes can't all be resolved. Serving such a definition would make the
            // docs renderer fail to resolve a nav node and return a 500. For those
            // APIs we serve the base (default-locale) definition and keep the base nav
            // ids, but still localize the sidebar titles we can match by locator.
            let servedLocaleApis = localeApis;
            let rewritableApiIds: ReadonlySet<string> | undefined;
            if (localeApis != null && updatedRoot != null) {
                const incompatibleApiIds = findIncompatibleTranslatedApiIds(updatedRoot, baseApis, localeApis);
                if (incompatibleApiIds.size > 0) {
                    context.logger.warn(
                        `Translated API definition(s) [${Array.from(incompatibleApiIds).join(", ")}] for locale ` +
                            `"${locale}" diverge from the default-locale spec (e.g. changed OpenAPI tag names, ` +
                            `operationIds, or paths, or a missing/added endpoint), so they can't be fully matched ` +
                            `to the navigation tree. Serving the default-locale API for those (localized sidebar ` +
                            `titles are still applied where they can be matched). For fully localized API reference ` +
                            `content, translate only human-readable text and keep tag names/operationIds/paths ` +
                            `identical to the base spec.`
                    );
                    servedLocaleApis = Object.fromEntries(
                        Object.entries(localeApis).filter(([apiId]) => !incompatibleApiIds.has(apiId))
                    );
                }
                rewritableApiIds = new Set(Object.keys(localeApis).filter((apiId) => !incompatibleApiIds.has(apiId)));
            }

            const hasServedLocaleApis = servedLocaleApis != null && Object.keys(servedLocaleApis).length > 0;
            const translatedApis = hasServedLocaleApis
                ? { ...docsDefinition.apis, ...servedLocaleApis }
                : docsDefinition.apis;

            // Splicing `apis` alone leaves the sidebar in the default language, since
            // the nav tree bakes in titles from the base API definition. Localize
            // titles for every translated API (matched by id or locator); ids are only
            // repointed for the APIs whose translated definition we actually serve.
            if (localeApis != null && Object.keys(localeApis).length > 0 && updatedRoot != null) {
                updatedRoot = applyTranslatedApiTitlesToNavTree(updatedRoot, baseApis, localeApis, {
                    rewritableApiIds
                });
            }

            const translatedDefinition: DocsV1Read.DocsDefinition = {
                ...docsDefinition,
                apis: translatedApis,
                pages: translatedPages,
                config: {
                    ...docsDefinition.config,
                    root: updatedRoot,
                    announcement: translatedAnnouncement,
                    navbarLinks: translatedNavbarLinks
                }
            };

            translations.set(locale, translatedDefinition);
            context.logger.debug(
                `Computed translated definition for locale "${locale}"` +
                    (localeApis != null ? ` (with ${Object.keys(localeApis).length} translated API(s))` : "")
            );
        } catch (error) {
            context.logger.warn(`Failed to compute translation for locale "${locale}": ${String(error)}`);
        }
    }

    return translations;
}
