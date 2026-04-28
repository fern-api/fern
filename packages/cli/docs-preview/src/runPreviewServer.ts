import {
    applyTranslatedFrontmatterToNavTree,
    applyTranslatedNavigationOverlays,
    getTranslatedAnnouncement,
    replaceImagePathsAndUrls,
    stripMdxComments,
    wrapWithHttps
} from "@fern-api/docs-resolver";
import { DocsV1Read, DocsV2Read, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, dirname, doesPathExist, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { CliError, TaskContext } from "@fern-api/task-context";

import chalk from "chalk";
import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import Watcher from "watcher";
import { type WebSocket, WebSocketServer } from "ws";

import { downloadBundle, getPathToBundleFolder } from "./downloadLocalDocsBundle.js";
import { getPreviewDocsDefinition, type PreviewDocsResult } from "./previewDocs.js";

const EMPTY_DOCS_DEFINITION: DocsV1Read.DocsDefinition = {
    pages: {},
    apis: {},
    apisV2: {},
    files: {},
    filesV2: {},
    config: {
        aiChatConfig: undefined,
        hideNavLinks: undefined,
        navigation: undefined,
        root: undefined,
        title: undefined,
        defaultLanguage: undefined,
        languages: undefined,
        announcement: undefined,
        navbarLinks: undefined,
        footerLinks: undefined,
        logoHeight: undefined,
        logoHref: undefined,
        logoRightText: undefined,
        favicon: undefined,
        metadata: undefined,
        redirects: undefined,
        colorsV3: undefined,
        layout: undefined,
        settings: undefined,
        typographyV2: undefined,
        analyticsConfig: undefined,
        integrations: undefined,
        css: undefined,
        js: undefined,
        pageActions: undefined,
        theme: undefined,
        header: undefined,
        footer: undefined,
        editThisPageLaunch: undefined
    },
    jsFiles: undefined,
    id: undefined,
    apiNameToId: {}
};

export async function runPreviewServer({
    initialProject,
    reloadProject,
    validateProject,
    context,
    port,
    bundlePath
}: {
    initialProject: Project;
    reloadProject: () => Promise<Project>;
    validateProject: (project: Project) => Promise<void>;
    context: TaskContext;
    port: number;
    bundlePath?: string;
}): Promise<void> {
    if (bundlePath != null) {
        context.logger.info(`Using bundle from path: ${bundlePath}`);
    } else {
        try {
            const url = process.env.DOCS_PREVIEW_BUCKET;
            if (url == null) {
                throw new CliError({
                    message: "Failed to connect to the docs preview server. Please contact support@buildwithfern.com",
                    code: CliError.Code.InternalError
                });
            }
            await downloadBundle({ bucketUrl: url, logger: context.logger, preferCached: true, tryTar: false });
        } catch (err) {
            const pathToBundle = getPathToBundleFolder({});
            if (err instanceof Error) {
                context.logger.debug(`Failed to download latest docs bundle: ${(err as Error).message}`);
            }
            if (await doesPathExist(pathToBundle)) {
                context.logger.warn("Falling back to cached bundle...");
            } else {
                context.logger.warn("Please reach out to support@buildwithfern.com.");
                return;
            }
        }
    }

    const absoluteFilePathToFern = dirname(initialProject.config._absolutePath);

    const app = express();
    const httpServer = http.createServer(app);
    const wss = new WebSocketServer({ server: httpServer });

    const connections = new Set<WebSocket>();
    function sendData(data: unknown) {
        for (const connection of connections) {
            connection.send(JSON.stringify(data));
        }
    }

    wss.on("connection", function connection(ws) {
        connections.add(ws);

        ws.on("close", function close() {
            connections.delete(ws);
        });
    });

    app.use(cors());

    const instance = new URL(
        wrapWithHttps(initialProject.docsWorkspaces?.config.instances[0]?.url ?? `http://localhost:${port}`)
    );

    let project = initialProject;
    let previewResult: PreviewDocsResult | undefined;
    // Pre-computed translated definitions for each locale (excluding default)
    let translatedDefinitions: Map<string, DocsV1Read.DocsDefinition> = new Map();

    let reloadTimer: NodeJS.Timeout | null = null;
    let isReloading = false;
    const RELOAD_DEBOUNCE_MS = 1000;

    /**
     * Computes translated definitions for each locale.
     */
    function computeTranslatedDefinitions(result: PreviewDocsResult): Map<string, DocsV1Read.DocsDefinition> {
        const translations = new Map<string, DocsV1Read.DocsDefinition>();
        const { docsDefinition, translationPages, translationNavigationOverlays, collectedFileIds, docsWorkspacePath } =
            result;

        if (translationPages == null || Object.keys(translationPages).length === 0) {
            return translations;
        }

        const defaultLocale = docsDefinition.config.translations?.defaultLocale;

        for (const [locale, localePages] of Object.entries(translationPages)) {
            // Skip the default locale - we use the base definition for that
            if (locale === defaultLocale) {
                continue;
            }

            try {
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
                        // Strip MDX comments first
                        let processedMarkdown = stripMdxComments(rawMarkdown);
                        // Replace image paths using collected file IDs
                        const absolutePathToMarkdownFile = resolve(docsWorkspacePath, RelativeFilePath.of(pagePath));
                        processedMarkdown = replaceImagePathsAndUrls(
                            processedMarkdown,
                            collectedFileIds,
                            {}, // markdownFilesToPathName not needed for translations
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
                if (localeNavOverlay != null) {
                    updatedRoot = applyTranslatedNavigationOverlays(updatedRoot, localeNavOverlay);
                    translatedAnnouncement = getTranslatedAnnouncement(localeNavOverlay) ?? translatedAnnouncement;
                }

                const translatedDefinition: DocsV1Read.DocsDefinition = {
                    ...docsDefinition,
                    pages: translatedPages,
                    config: {
                        ...docsDefinition.config,
                        root: updatedRoot,
                        announcement: translatedAnnouncement
                    }
                };

                translations.set(locale, translatedDefinition);
                context.logger.debug(`Computed translated definition for locale "${locale}"`);
            } catch (error) {
                context.logger.warn(`Failed to compute translation for locale "${locale}": ${String(error)}`);
            }
        }

        return translations;
    }

    const reloadDocsDefinition = async (editedAbsoluteFilepaths?: AbsoluteFilePath[]) => {
        context.logger.info("Reloading docs...");
        const startTime = Date.now();
        try {
            project = await reloadProject();
            context.logger.info("Validating docs...");
            await validateProject(project);
            const newPreviewResult = await getPreviewDocsDefinition({
                domain: `${instance.host}${instance.pathname}`,
                project,
                context,
                previousDocsDefinition: previewResult?.docsDefinition,
                editedAbsoluteFilepaths,
                previousPreviewResult: previewResult
            });
            context.logger.info(`Reload completed in ${Date.now() - startTime}ms`);
            return newPreviewResult;
        } catch (err) {
            if (previewResult == null) {
                context.logger.error("Failed to read docs configuration. Rendering blank page.");
            } else {
                context.logger.error("Failed to read docs configuration. Rendering last successful configuration.");
            }
            if (err instanceof Error) {
                context.logger.error(err.message);
                if (err instanceof Error && err.stack) {
                    context.logger.debug(`Stack Trace:\n${err.stack}`);
                }
            }
            return previewResult;
        }
    };

    // initialize docs definition
    previewResult = await reloadDocsDefinition();

    // Compute translated definitions after loading
    if (previewResult != null) {
        translatedDefinitions = computeTranslatedDefinitions(previewResult);
        if (translatedDefinitions.size > 0) {
            context.logger.info(`Computed translations for ${translatedDefinitions.size} locale(s)`);
        }
    }

    const additionalFilepaths = project.apiWorkspaces.flatMap((workspace) => workspace.getAbsoluteFilePaths());
    const bundleRoot = bundlePath ? AbsoluteFilePath.of(path.resolve(bundlePath)) : getPathToBundleFolder({});

    const watcher = new Watcher([absoluteFilePathToFern, ...additionalFilepaths], {
        recursive: true,
        ignoreInitial: true,
        debounce: 100,
        renameDetection: true
    });

    const editedAbsoluteFilepaths: AbsoluteFilePath[] = [];

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    watcher.on("all", async (event: string, targetPath: string, _targetPathNext: string) => {
        context.logger.info(chalk.dim(`[${event}] ${targetPath}`));

        // Don't schedule another reload if one is in progress
        if (isReloading) {
            return;
        }

        editedAbsoluteFilepaths.push(AbsoluteFilePath.of(targetPath));

        // Clear any existing timer
        if (reloadTimer != null) {
            clearTimeout(reloadTimer);
        }

        // Set up new timer
        reloadTimer = setTimeout(() => {
            void (async () => {
                isReloading = true;
                sendData({
                    version: 1,
                    type: "startReload"
                });

                const reloadedPreviewResult = await reloadDocsDefinition(editedAbsoluteFilepaths);
                if (reloadedPreviewResult != null) {
                    previewResult = reloadedPreviewResult;
                    // Recompute translated definitions
                    translatedDefinitions = computeTranslatedDefinitions(reloadedPreviewResult);
                    if (translatedDefinitions.size > 0) {
                        context.logger.debug(`Recomputed translations for ${translatedDefinitions.size} locale(s)`);
                    }
                }

                editedAbsoluteFilepaths.length = 0;

                sendData({
                    version: 1,
                    type: "finishReload"
                });
                isReloading = false;
            })();
        }, RELOAD_DEBOUNCE_MS);
    });

    /**
     * Extracts the locale from a URL or path.
     * E.g., "/fr/getting-started" -> "fr", "http://localhost:3000/ja/intro" -> "ja"
     */
    function extractLocaleFromPath(urlPath: string | undefined): string | undefined {
        if (urlPath == null) {
            return undefined;
        }
        const baseDefinition = previewResult?.docsDefinition;
        const defaultLocale = baseDefinition?.config.translations?.defaultLocale;
        const availableLocales = baseDefinition?.config.translations?.translations;

        if (availableLocales == null || availableLocales.length === 0) {
            return undefined;
        }

        // Parse as URL if it's a full URL, otherwise treat as path
        let pathname = urlPath;
        try {
            pathname = new URL(urlPath).pathname;
        } catch {
            // urlPath is already a bare path (e.g. "/fr/getting-started")
        }

        // Check if path starts with a locale prefix
        const pathParts = pathname.split("/").filter((p) => p.length > 0);
        if (pathParts.length > 0) {
            const firstPart = pathParts[0];
            if (firstPart != null && availableLocales.includes(firstPart) && firstPart !== defaultLocale) {
                return firstPart;
            }
        }
        return undefined;
    }

    // Parse JSON body middleware
    app.use(express.json());

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.post("/v2/registry/docs/load-with-url", async (req, res) => {
        try {
            // set to empty in case previewResult is null which happens when the initial docs definition is invalid
            const baseDefinition = previewResult?.docsDefinition ?? EMPTY_DOCS_DEFINITION;

            // Extract locale from the request body URL if present
            const requestBody = req.body as { url?: string } | undefined;
            const urlPath = requestBody?.url;
            const locale = extractLocaleFromPath(urlPath);

            // Use translated definition if available for the requested locale
            let definition = baseDefinition;
            if (locale != null && translatedDefinitions.has(locale)) {
                definition = translatedDefinitions.get(locale) ?? baseDefinition;
                context.logger.debug(`Serving translated definition for locale "${locale}"`);
            }

            const translationsConfig = baseDefinition.config.translations;
            const response: DocsV2Read.LoadDocsForUrlResponse = {
                baseUrl: {
                    domain: instance.host,
                    basePath: instance.pathname
                },
                definition,
                lightModeEnabled: definition.config.colorsV3?.type !== "dark",
                orgId: FernNavigation.OrgId(initialProject.config.organization),
                // Include translations config for language switcher support in preview mode
                defaultLocale: translationsConfig?.defaultLocale,
                translations: translationsConfig?.translations
            };
            res.send(response);
        } catch (error) {
            context.logger.error("Stack trace:", (error as Error).stack ?? "");
            context.logger.error("Error loading docs", (error as Error).message);
            res.status(500).send();
        }
    });

    app.get(/^\/_local\/(.*)/, (req, res) => {
        const requestedPath = `/${req.params[0]}`;

        // Build a set of allowed file paths from the docs definition
        const allowedPaths = new Set<string>();
        if (previewResult?.docsDefinition?.filesV2) {
            for (const file of Object.values(previewResult.docsDefinition.filesV2)) {
                if (file != null && file.type === "url") {
                    const urlPath = file.url.replace(/^\/_local/, "");
                    allowedPaths.add(urlPath);
                }
            }
        }

        if (!allowedPaths.has(requestedPath)) {
            context.logger.warn(`Blocked unauthorized file access attempt: ${requestedPath}`);
            return res.status(403).send("Access denied");
        }

        return res.sendFile(requestedPath);
    });

    app.get("/", (req, _res, next) => {
        if (req.headers.upgrade === "websocket") {
            return wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
                wss.emit("connection", ws, req);
            });
        }
        return next();
    });

    app.use("/_next", express.static(path.join(bundleRoot, "/_next")));

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.use("*", async (_req, res) => {
        return res.sendFile(path.join(bundleRoot, "/[[...slug]].html"));
    });

    app.listen(port);

    context.logger.info(`Running server on http://localhost:${port}`);

    // await infinitely
    // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
    await new Promise(() => {});
}
