import { extractErrorMessage } from "@fern-api/core-utils";
import {
    applyTranslatedFrontmatterToNavTree,
    replaceImagePathsAndUrls,
    stripMdxComments,
    wrapWithHttps
} from "@fern-api/docs-resolver";
import { DocsV1Read, DocsV2Read, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, dirname, doesPathExist, listFiles, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { runExeca } from "@fern-api/logging-execa";
import { Project } from "@fern-api/project-loader";
import { CliError, TaskContext } from "@fern-api/task-context";

import chalk from "chalk";
import { execSync } from "child_process";
import cors from "cors";
import express from "express";
import fs from "fs";
import { readFile, rm } from "fs/promises";
import http, { type IncomingMessage } from "http";
import path from "path";
import { type Duplex } from "stream";
import Watcher from "watcher";
import { WebSocket, WebSocketServer } from "ws";
import { type BunServer, createBunServer } from "./createBunServer.js";
import { DebugLogger } from "./DebugLogger.js";
import { downloadBundle, getPathToBundleFolder, getPathToPreviewFolder } from "./downloadLocalDocsBundle.js";
import { writeNodePolyfillScript } from "./nodePolyfills.js";
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

// The FDR SDK types config.root as {} via zod inference, but at runtime it is FernNavigation.V1.RootNode.
// This type guard checks the "type" discriminant to safely narrow the type without a blind cast.
function isV1RootNode(value: object): value is FernNavigation.V1.RootNode {
    return "type" in value && (value as { type: unknown }).type === "root";
}

/**
 * Slug tracking system for navigation changes
 */
class SlugChangeTracker {
    private pageSlugMap = new Map<string, string>(); // pageId -> slug

    constructor(private context: TaskContext) {}

    /**
     * Extract all page slugs using the FernNavigation NodeCollector
     * This handles both navigation structure and frontmatter slug overrides
     */
    private extractSlugsFromNavigationRoot(root: FernNavigation.RootNode): Map<string, string> {
        const slugMap = new Map<string, string>();

        if (!root) {
            return slugMap;
        }

        try {
            // Use FernNavigation's NodeCollector to get the definitive slug mappings
            // This already processes frontmatter slugs, navigation slugs, and all overrides
            const collector = FernNavigation.NodeCollector.collect(root);

            if (collector?.slugMap) {
                // collector.slugMap is Map<string, FernNavigationNode> where key is the final resolved slug
                collector.slugMap.forEach((node: FernNavigation.NavigationNode | null, slug: string) => {
                    if (node && node.type === "page" && node.pageId) {
                        slugMap.set(node.pageId, slug);
                    }
                });
            } else {
                // Fallback to manual traversal if NodeCollector is not available
                this.traverseNavigationManually(root, slugMap);
            }
        } catch (error) {
            // Fallback to manual traversal on any error
            this.traverseNavigationManually(root, slugMap);
        }

        return slugMap;
    }

    /**
     * Fallback method for manual navigation traversal
     */
    private traverseNavigationManually(obj: unknown, slugMap: Map<string, string>): void {
        if (obj && typeof obj === "object") {
            // Type guard to check if object has the expected navigation node properties
            if (this.isNavigationNodeLike(obj) && obj.type === "page" && obj.pageId && obj.slug) {
                slugMap.set(obj.pageId, obj.slug);
            }

            if (Array.isArray(obj)) {
                obj.forEach((item) => {
                    this.traverseNavigationManually(item, slugMap);
                });
            } else {
                Object.entries(obj).forEach(([key, value]) => {
                    if (value && (typeof value === "object" || Array.isArray(value))) {
                        this.traverseNavigationManually(value, slugMap);
                    }
                });
            }
        }
    }

    /**
     * Type guard to check if an object has navigation node properties
     */
    private isNavigationNodeLike(obj: object): obj is { type?: string; pageId?: string; slug?: string } {
        return typeof obj === "object" && obj !== null;
    }

    /**
     * Update the slug mappings from a docs definition and detect changes
     */
    updateAndDetectChanges(docsDefinition: DocsV1Read.DocsDefinition): Array<{ oldSlug: string; newSlug: string }> {
        const changes: Array<{ oldSlug: string; newSlug: string }> = [];

        // Extract new slug mappings - use the FernNavigation root structure
        let newSlugMap: Map<string, string>;
        const configRoot = docsDefinition.config.root;
        if (configRoot && isV1RootNode(configRoot)) {
            // Convert V1 navigation root to latest version
            const migratedRoot = FernNavigation.migrate.FernNavigationV1ToLatest.create().root(configRoot);
            newSlugMap = this.extractSlugsFromNavigationRoot(migratedRoot);

            // If this is the first time we have navigation root, treat all as "new" but don't report changes
            if (this.pageSlugMap.size === 0) {
                this.pageSlugMap = newSlugMap;
                return []; // No changes to report on first population
            }
        } else {
            return []; // Can't detect changes without navigation
        }

        // Compare with previous mappings
        for (const [pageId, newSlug] of newSlugMap.entries()) {
            const oldSlug = this.pageSlugMap.get(pageId);

            if (oldSlug && oldSlug !== newSlug) {
                changes.push({ oldSlug, newSlug });
            }
        }

        // Update the stored mappings
        this.pageSlugMap = newSlugMap;
        return changes;
    }

    /**
     * Initialize slug mappings from a docs definition
     */
    initialize(docsDefinition: DocsV1Read.DocsDefinition): void {
        const configRoot = docsDefinition.config.root;
        if (configRoot && isV1RootNode(configRoot)) {
            // Convert V1 navigation root to latest version
            const migratedRoot = FernNavigation.migrate.FernNavigationV1ToLatest.create().root(configRoot);
            this.pageSlugMap = this.extractSlugsFromNavigationRoot(migratedRoot);
        } else {
            // Initialize empty map, will be populated when navigation is ready during change detection
            this.pageSlugMap = new Map();
        }
    }
}

/**
 * Dependency tracking system for markdown snippets
 */
class SnippetDependencyTracker {
    // Map: snippet file path -> Set of page files that reference it
    private snippetToPages = new Map<string, Set<string>>();
    // Map: page file path -> Set of snippet files it references
    private pageToSnippets = new Map<string, Set<string>>();

    constructor(private context: TaskContext) {}

    /**
     * Extract referenced markdown and code files from a markdown file
     */
    private extractReferences(
        markdown: string,
        markdownFilePath: AbsoluteFilePath,
        fernFolderPath: AbsoluteFilePath
    ): Set<string> {
        const references = new Set<string>();

        // Extract markdown references: <Markdown src="path/to/file.md" />
        const markdownRegex = /<Markdown\s+src={?['"]([^'"]+\.mdx?)['"](?! \+)}?\s*\/>/g;
        let match;
        while ((match = markdownRegex.exec(markdown)) !== null) {
            const src = match[1];
            if (src) {
                const referencedFilePath = resolve(
                    src.startsWith("/") ? fernFolderPath : dirname(markdownFilePath),
                    RelativeFilePath.of(src.replace(/^\//, ""))
                );
                references.add(referencedFilePath);
            }
        }

        // Extract code references: <Code src="path/to/file.js" />
        const codeRegex = /<Code(?:\s+[^>]*?)?\s+src={?['"]([^'"]+)['"](?! \+)}?((?:\s+[^>]*)?)\/>/g;
        while ((match = codeRegex.exec(markdown)) !== null) {
            const src = match[1];
            if (src) {
                const referencedFilePath = resolve(
                    src.startsWith("/") ? fernFolderPath : dirname(markdownFilePath),
                    RelativeFilePath.of(src.replace(/^\//, ""))
                );
                references.add(referencedFilePath);
            }
        }

        return references;
    }

    /**
     * Scan all pages in the project and build dependency maps
     */
    async buildDependencyMap(project: Project): Promise<void> {
        this.snippetToPages.clear();
        this.pageToSnippets.clear();

        const docsWorkspace = project.docsWorkspaces;
        if (!docsWorkspace) {
            return;
        }

        this.context.logger.debug("Building snippet dependency map...");

        try {
            // Find all markdown files in the docs workspace directory
            const markdownFiles = await this.findMarkdownFiles(docsWorkspace.absoluteFilePath);

            for (const markdownFile of markdownFiles) {
                try {
                    const content = await readFile(markdownFile, "utf-8");
                    const referencedFiles = this.extractReferences(
                        content,
                        markdownFile,
                        docsWorkspace.absoluteFilePath
                    );

                    // Update page -> snippets mapping
                    this.pageToSnippets.set(markdownFile, referencedFiles);

                    // Update snippet -> pages mapping
                    for (const referencedFile of referencedFiles) {
                        if (!this.snippetToPages.has(referencedFile)) {
                            this.snippetToPages.set(referencedFile, new Set());
                        }
                        this.snippetToPages.get(referencedFile)?.add(markdownFile);
                    }
                } catch (error) {
                    this.context.logger.debug(`Failed to read markdown file ${markdownFile}: ${error}`);
                }
            }

            this.context.logger.debug(
                `Built dependency map: ${this.snippetToPages.size} snippets, ${this.pageToSnippets.size} pages`
            );
        } catch (error) {
            this.context.logger.debug(`Failed to build dependency map: ${error}`);
        }
    }

    /**
     * Find all markdown files in the docs workspace directory
     */
    private async findMarkdownFiles(fernFolderPath: AbsoluteFilePath): Promise<AbsoluteFilePath[]> {
        try {
            // Get .md files
            const mdFiles = await listFiles(fernFolderPath, "md");
            // Get .mdx files
            const mdxFiles = await listFiles(fernFolderPath, "mdx");
            // Combine both lists
            return [...mdFiles, ...mdxFiles];
        } catch (error) {
            this.context.logger.debug(`Failed to list files in ${fernFolderPath}: ${error}`);
            return [];
        }
    }

    /**
     * Given a list of changed files, return all files that need to be reloaded (including dependent pages)
     */
    getFilesToReload(changedFiles: AbsoluteFilePath[]): AbsoluteFilePath[] {
        const filesToReload = new Set<string>();

        // Add all originally changed files
        for (const file of changedFiles) {
            filesToReload.add(file);
        }

        // For each changed file, check if it's a snippet that other pages depend on
        for (const changedFile of changedFiles) {
            const dependentPages = this.snippetToPages.get(changedFile);
            if (dependentPages) {
                this.context.logger.debug(`Snippet ${changedFile} affects ${dependentPages.size} pages`);
                for (const dependentPage of dependentPages) {
                    filesToReload.add(dependentPage);
                }
            }
        }

        return Array.from(filesToReload).map(AbsoluteFilePath.of);
    }

    /**
     * Check if any of the changed files are snippets that affect other pages
     */
    hasSnippetDependencies(changedFiles: AbsoluteFilePath[]): boolean {
        for (const file of changedFiles) {
            const pages = this.snippetToPages.get(file);
            if (pages && pages.size > 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get debug info about current dependencies
     */
    getDebugInfo(): { snippetCount: number; pageCount: number; totalDependencies: number } {
        let totalDependencies = 0;
        for (const pages of this.snippetToPages.values()) {
            totalDependencies += pages.size;
        }
        return {
            snippetCount: this.snippetToPages.size,
            pageCount: this.pageToSnippets.size,
            totalDependencies
        };
    }
}

/**
 * Resolves the path to the Fern Docs cache directory within the standalone server bundle.
 * The standalone server runs from `<bundleRoot>/standalone/packages/fern-docs/bundle/server.js`,
 * so its runtime cache is written to `<bundleRoot>/standalone/packages/fern-docs/bundle/.next/cache/`.
 */
function getFernDocsCachePath(bundleRoot: string): string {
    return path.join(bundleRoot, "standalone/packages/fern-docs/bundle/.next/cache");
}

/**
 * Removes the Fern Docs cache directory.
 */
async function cleanFernDocsCache(bundleRoot: string, context: TaskContext): Promise<void> {
    const cachePath = getFernDocsCachePath(bundleRoot);
    try {
        const cacheExists = await doesPathExist(AbsoluteFilePath.of(cachePath));
        if (cacheExists) {
            context.logger.debug(`Cleaning Fern Docs cache at ${cachePath}`);
            await rm(cachePath, { recursive: true });
            context.logger.debug("Fern Docs cache cleaned successfully");
        } else {
            context.logger.debug("No Fern Docs cache to clean");
        }
    } catch (err) {
        context.logger.debug(`Failed to clean Fern Docs cache: ${err}`);
    }
}

/**
 * Synchronous version of cleanFernDocsCache for use in signal handlers
 * where async operations cannot be awaited.
 */
function cleanFernDocsCacheSync(bundleRoot: string, context: TaskContext): void {
    const cachePath = getFernDocsCachePath(bundleRoot);
    try {
        if (fs.existsSync(cachePath)) {
            context.logger.debug(`Cleaning Fern Docs cache at ${cachePath}`);
            fs.rmSync(cachePath, { recursive: true, maxRetries: 5, retryDelay: 500 });
            context.logger.debug("Fern Docs cache cleaned successfully");
        }
    } catch (err) {
        context.logger.debug(`Failed to clean Fern Docs cache: ${err}`);
    }
}

/**
 * Finds and kills any processes still listening on the given port.
 * This is a best-effort fallback to clean up zombie Next.js worker
 * processes that may survive after the main server process is killed.
 */
function killProcessesOnPort(targetPort: number, context: TaskContext): void {
    context.logger.debug(`Killing any leftover processes on port ${targetPort}`);
    const isWindows = process.platform === "win32";
    const command = isWindows
        ? `netstat -ano | findstr :${targetPort} | findstr LISTENING`
        : `lsof -ti tcp:${targetPort}`;

    try {
        const output = execSync(command, { encoding: "utf-8", timeout: 5000 });

        let pids: string[];
        if (isWindows) {
            pids = output
                .trim()
                .split("\n")
                .map((line) => line.trim().split(/\s+/).pop() ?? "")
                .filter((pid) => pid.length > 0 && pid !== String(process.pid));
            pids = [...new Set(pids)];
        } else {
            pids = output
                .trim()
                .split("\n")
                .map((pid) => pid.trim())
                .filter((pid) => pid.length > 0 && pid !== String(process.pid));
        }

        for (const pid of pids) {
            try {
                context.logger.debug(`Killing leftover process ${pid} on port ${targetPort}`);
                if (isWindows) {
                    execSync(`taskkill /F /PID ${pid}`, { timeout: 5000 });
                } else {
                    process.kill(Number(pid), "SIGKILL");
                }
            } catch {
                // Process may have already exited
            }
        }
    } catch {
        // Command returns non-zero when no matches are found — nothing to kill
    }
}

export async function runAppPreviewServer({
    initialProject,
    reloadProject,
    validateProject,
    context,
    port,
    bundlePath,
    backendPort,
    forceDownload
}: {
    initialProject: Project;
    reloadProject: () => Promise<Project>;
    validateProject: (project: Project) => Promise<void>;
    context: TaskContext;
    port: number;
    bundlePath?: string;
    backendPort: number;
    forceDownload?: boolean;
}): Promise<void> {
    if (forceDownload) {
        const appPreviewFolder = getPathToPreviewFolder({ app: true });
        if (await doesPathExist(appPreviewFolder)) {
            context.logger.info("Force download requested. Deleting cached bundle...");
            await rm(appPreviewFolder, { recursive: true });
        }
    }

    if (bundlePath != null) {
        context.logger.info(`Using bundle from path: ${bundlePath}`);
    } else {
        try {
            const url = process.env.APP_DOCS_TAR_PREVIEW_BUCKET;
            if (url == null) {
                throw new CliError({
                    message: "Failed to connect to the docs preview server. Please contact support@buildwithfern.com",
                    code: CliError.Code.InternalError
                });
            }
            await downloadBundle({
                bucketUrl: url,
                logger: context.logger,
                preferCached: true,
                app: true,
                tryTar: true
            });
        } catch (err) {
            if (err instanceof Error) {
                context.logger.debug(`Failed to download latest docs bundle: ${(err as Error).message}`);
                context.logger.error("Failed to unzip .tar.gz bundle. Please report to support@buildwithfern.com");
            }

            context.logger.debug("Falling back to .zip bundle");
            try {
                const url = process.env.APP_DOCS_PREVIEW_BUCKET;
                if (url == null) {
                    throw new CliError({
                        message:
                            "Failed to connect to the docs preview server. Please contact support@buildwithfern.com",
                        code: CliError.Code.InternalError
                    });
                }
                await downloadBundle({
                    bucketUrl: url,
                    logger: context.logger,
                    preferCached: true,
                    app: true,
                    tryTar: false
                });
            } catch (err) {
                if (await doesPathExist(getPathToBundleFolder({ app: true }))) {
                    context.logger.warn("Falling back to cached bundle...");
                } else {
                    context.logger.warn("Please reach out to support@buildwithfern.com.");
                    return;
                }
            }
        }
    }

    const bundleRoot = bundlePath || getPathToBundleFolder({ app: true });
    const serverPath = path.join(bundleRoot, "standalone/packages/fern-docs/bundle/server.js");

    const absoluteFilePathToFern = dirname(initialProject.config._absolutePath);

    // Initialize the debug logger for metrics collection
    const debugLogger = new DebugLogger();
    await debugLogger.initialize({
        debug: (msg) => context.logger.debug(msg),
        info: (msg) => context.logger.info(msg)
    });
    const debugLogPath = debugLogger.getLogFilePath();
    if (debugLogPath) {
        context.logger.info(chalk.dim(`Debug log: ${debugLogPath}`));
    }

    let bunServer: BunServer | undefined;

    // Set up backend server first (before Next.js) so it's ready to serve requests
    const app = express();
    const httpServer = http.createServer(app);

    // Use noServer mode so we can handle upgrades explicitly.
    // This ensures compatibility with both Node.js and Bun runtimes.
    const wss = new WebSocketServer({
        noServer: true,
        clientTracking: true,
        perMessageDeflate: false
    });

    // Primary upgrade handler — works in Node.js where http.Server emits 'upgrade'.
    httpServer.on("upgrade", (request: IncomingMessage, socket: Duplex, head: Buffer) => {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit("connection", ws, request);
        });
    });

    const connections = new Map<
        WebSocket,
        {
            id: string;
            pingInterval: NodeJS.Timeout;
            isAlive: boolean;
            lastPong: number;
        }
    >();

    let sendData: (data: unknown) => void = (data: unknown) => {
        const message = JSON.stringify(data);
        const deadConnections: WebSocket[] = [];

        for (const [connection, metadata] of connections) {
            if (connection.readyState === WebSocket.OPEN) {
                try {
                    connection.send(message);
                } catch (error) {
                    context.logger.debug(`Failed to send message to connection ${metadata.id}: ${error}`);
                    deadConnections.push(connection);
                }
            } else {
                deadConnections.push(connection);
            }
        }

        deadConnections.forEach((conn) => {
            const metadata = connections.get(conn);
            if (metadata) {
                clearInterval(metadata.pingInterval);
                connections.delete(conn);
            }
        });
    };

    wss.on("connection", function connection(ws, req) {
        const connectionId = `${req.socket.remoteAddress}:${req.socket.remotePort}-${Date.now()}`;

        const metadata = {
            id: connectionId,
            isAlive: true,
            lastPong: Date.now(),
            pingInterval: setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    // check if we received a pong recently
                    const now = Date.now();
                    if (now - metadata.lastPong > 90000) {
                        // 90 seconds timeout
                        context.logger.debug(`Connection ${connectionId} timed out, closing`);
                        ws.terminate();
                        return;
                    }

                    metadata.isAlive = false;
                    try {
                        ws.send(JSON.stringify({ type: "ping", timestamp: now }));
                    } catch (error) {
                        context.logger.debug(`Failed to send ping to ${connectionId}: ${error}`);
                        ws.terminate();
                    }
                }
            }, 30000) // ping every 30 seconds
        };

        connections.set(ws, metadata);

        ws.on("message", function message(data) {
            try {
                const parsed = JSON.parse(data.toString());
                if (parsed.type === "pong") {
                    metadata.isAlive = true;
                    metadata.lastPong = Date.now();
                } else if (DebugLogger.isMetricsMessage(parsed)) {
                    // Handle metrics messages from the frontend
                    void debugLogger.logFrontendMetrics(parsed);
                }
            } catch (error) {
                context.logger.debug(`Failed to parse message from ${connectionId}: ${error}`);
            }
        });

        ws.on("error", function error(err) {
            context.logger.debug(`WebSocket error for connection ${connectionId}: ${err.message}`);
        });

        ws.on("close", function close(code, reason) {
            clearInterval(metadata.pingInterval);
            connections.delete(ws);
        });

        // Send initial connection confirmation
        try {
            ws.send(JSON.stringify({ type: "connected", connectionId }));
        } catch (error) {
            context.logger.debug(`Failed to send connection confirmation: ${error}`);
        }
    });

    app.use(cors());

    const instance = new URL(
        wrapWithHttps(initialProject.docsWorkspaces?.config.instances[0]?.url ?? `http://localhost:${port}`)
    );

    let project = initialProject;
    let previewResult: PreviewDocsResult | undefined;
    // Pre-computed translated definitions for each locale (excluding default)
    let translatedDefinitions: Map<string, DocsV1Read.DocsDefinition> = new Map();

    // Initialize the snippet dependency tracker
    const snippetTracker = new SnippetDependencyTracker(context);
    await snippetTracker.buildDependencyMap(project);

    // Initialize the slug change tracker
    const slugTracker = new SlugChangeTracker(context);

    let reloadTimer: NodeJS.Timeout | null = null;
    let isReloading = false;
    const RELOAD_DEBOUNCE_MS = 1000;

    /**
     * Computes translated definitions for each locale.
     * Similar to what publishDocs.ts does for production, but for local preview.
     */
    function computeTranslatedDefinitions(result: PreviewDocsResult): Map<string, DocsV1Read.DocsDefinition> {
        const translations = new Map<string, DocsV1Read.DocsDefinition>();
        const { docsDefinition, translationPages, collectedFileIds, docsWorkspacePath } = result;

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
                }

                // Apply translated frontmatter to nav tree
                const updatedRoot = applyTranslatedFrontmatterToNavTree(
                    docsDefinition.config.root,
                    localePages as Record<string, string>,
                    context
                );

                const translatedDefinition: DocsV1Read.DocsDefinition = {
                    ...docsDefinition,
                    pages: translatedPages,
                    config: {
                        ...docsDefinition.config,
                        root: updatedRoot
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

        // Log CLI reload start
        void debugLogger.logCliReloadStart();

        try {
            project = await reloadProject();

            // Rebuild dependency map after reloading project
            await snippetTracker.buildDependencyMap(project);

            // Start validation in background - don't block the reload
            const validationStartTime = Date.now();
            void validateProject(project)
                .then(() => {
                    const validationTime = Date.now() - validationStartTime;
                    void debugLogger.logCliValidation(validationTime, true);
                })
                .catch((err) => {
                    const validationTime = Date.now() - validationStartTime;
                    void debugLogger.logCliValidation(validationTime, false);
                    context.logger.error(`Validation failed (took ${validationTime}ms): ${extractErrorMessage(err)}`);
                    // Still log validation errors to help developers
                    if (err instanceof Error && err.stack) {
                        context.logger.debug(`Validation error stack: ${err.stack}`);
                    }
                });

            const docsGenStartTime = Date.now();
            const newPreviewResult = await getPreviewDocsDefinition({
                domain: `${instance.host}${instance.pathname}`,
                project,
                context,
                previousDocsDefinition: previewResult?.docsDefinition,
                editedAbsoluteFilepaths,
                previousPreviewResult: previewResult
            });
            const docsGenTime = Date.now() - docsGenStartTime;

            // Log CLI docs generation time
            void debugLogger.logCliDocsGeneration(docsGenTime, {
                filesEdited: editedAbsoluteFilepaths?.length ?? 0
            });

            const totalTime = Date.now() - startTime;
            context.logger.info(`Reload completed in ${totalTime}ms`);

            // Log CLI reload finish with total time and memory
            void debugLogger.logCliReloadFinish(totalTime, {
                docsGenerationMs: docsGenTime,
                filesEdited: editedAbsoluteFilepaths?.length ?? 0
            });
            void debugLogger.logCliMemory();

            return newPreviewResult;
        } catch (err) {
            const totalTime = Date.now() - startTime;

            // Log CLI reload finish even on error
            void debugLogger.logCliReloadFinish(totalTime, {
                error: true,
                errorMessage: extractErrorMessage(err)
            });
            void debugLogger.logCliMemory();

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

    previewResult = await reloadDocsDefinition();

    // Compute translated definitions after loading
    if (previewResult != null) {
        translatedDefinitions = computeTranslatedDefinitions(previewResult);
        if (translatedDefinitions.size > 0) {
            context.logger.info(`Computed translations for ${translatedDefinitions.size} locale(s)`);
        }
    }

    // Initialize slug mappings from the initial docs definition
    if (previewResult?.docsDefinition) {
        slugTracker.initialize(previewResult.docsDefinition);
    }

    const additionalFilepaths = project.apiWorkspaces.flatMap((workspace) => workspace.getAbsoluteFilePaths());

    // Create watcher but don't attach the event handler yet - we'll do that after the Next.js server starts
    const watcher = new Watcher([absoluteFilePathToFern, ...additionalFilepaths], {
        recursive: true,
        ignoreInitial: true,
        debounce: 100,
        renameDetection: true
    });

    const editedAbsoluteFilepaths: AbsoluteFilePath[] = [];

    /**
     * Extracts the locale from a URL path.
     * E.g., "/fr/getting-started" -> "fr", "/getting-started" -> undefined
     */
    function extractLocaleFromPath(urlPath: string | undefined): string | undefined {
        if (urlPath == null) {
            return undefined;
        }
        const defaultLocale = previewResult?.docsDefinition.config.translations?.defaultLocale;
        const availableLocales = previewResult?.docsDefinition.config.translations?.translations;

        if (availableLocales == null || availableLocales.length === 0) {
            return undefined;
        }

        // Check if path starts with a locale prefix
        const pathParts = urlPath.split("/").filter((p) => p.length > 0);
        if (pathParts.length > 0) {
            const firstPart = pathParts[0];
            if (firstPart != null && availableLocales.includes(firstPart) && firstPart !== defaultLocale) {
                return firstPart;
            }
        }
        return undefined;
    }

    function buildDocsLoadResponse(locale?: string): DocsV2Read.LoadDocsForUrlResponse {
        // Fall back to empty definition if the initial load failed
        const baseDefinition = previewResult?.docsDefinition ?? EMPTY_DOCS_DEFINITION;

        // Use translated definition if available for the requested locale
        let definition = baseDefinition;
        if (locale != null && translatedDefinitions.has(locale)) {
            definition = translatedDefinitions.get(locale) ?? baseDefinition;
            context.logger.debug(`Serving translated definition for locale "${locale}"`);
        }

        const translationsConfig = baseDefinition.config.translations;
        return {
            baseUrl: { domain: instance.host, basePath: instance.pathname },
            definition,
            lightModeEnabled: definition.config.colorsV3?.type !== "dark",
            orgId: FernNavigation.OrgId(initialProject.config.organization),
            // Include translations config for language switcher support in preview mode
            defaultLocale: translationsConfig?.defaultLocale,
            translations: translationsConfig?.translations
        };
    }

    // Parse JSON body middleware for the load-with-url endpoint
    app.use(express.json());

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.post("/v2/registry/docs/load-with-url", async (req, res) => {
        try {
            // Extract locale from the request body URL if present
            const requestBody = req.body as { url?: string } | undefined;
            const urlPath = requestBody?.url;
            const locale = extractLocaleFromPath(urlPath);

            res.send(buildDocsLoadResponse(locale));
        } catch (error) {
            context.logger.error("Stack trace:", (error as Error).stack ?? "");
            context.logger.error("Error loading docs", (error as Error).message);
            res.status(500).send();
        }
    });

    app.get(/^\/_local\/(.*)/, (req, res) => {
        return res.sendFile(`/${req.params[0]}`);
    });

    // Start backend server first and wait for it to be ready.
    //
    // In Bun, http.createServer does not emit the 'upgrade' event that
    // the ws package relies on (re: oven-sh/bun#5951).
    const bunHandle = createBunServer({
        port: backendPort,
        debugLogger,
        getDocsLoadResponse: buildDocsLoadResponse,
        extractLocaleFromPath
    });
    if (bunHandle != null) {
        sendData = bunHandle.sendData;
        bunServer = bunHandle;
        context.logger.info(chalk.dim(`Backend server running on http://localhost:${backendPort}`));
    } else {
        await new Promise<void>((resolve) => {
            httpServer.listen(backendPort, () => {
                context.logger.info(chalk.dim(`Backend server running on http://localhost:${backendPort}`));
                resolve();
            });
        });
    }

    // Clean Fern Docs cache from previous runs before starting the server
    await cleanFernDocsCache(bundleRoot, context);

    // Write Node.js polyfills for older runtimes (e.g. Node 20) so the
    // pre-built Next.js bundle can use APIs introduced in Node 22+.
    const polyfillPath = writeNodePolyfillScript(bundleRoot);

    // Now start Next.js after backend is ready

    const env = {
        ...process.env,
        PORT: port.toString(),
        HOSTNAME: "0.0.0.0",
        NEXT_PUBLIC_FDR_ORIGIN_PORT: backendPort.toString(),
        NEXT_PUBLIC_FDR_ORIGIN: `http://localhost:${backendPort}`,
        NEXT_PUBLIC_DOCS_DOMAIN: initialProject.docsWorkspaces?.config.instances[0]?.url,
        NEXT_PUBLIC_IS_LOCAL: "1",
        NEXT_DISABLE_CACHE: "1",
        NODE_ENV: "production",
        NODE_PATH: bundleRoot,
        NODE_OPTIONS: `--max-old-space-size=8096 --enable-source-maps --require ${polyfillPath}`
    };

    // Track the current server process and the port it actually bound to
    let serverProcess: ReturnType<typeof runExeca> | null = null;
    let actualPort: number = port;

    // Function to start the Next.js server
    const startNextJsServer = (): Promise<void> => {
        return new Promise((resolve) => {
            serverProcess = runExeca(context.logger, "node", [serverPath], {
                env,
                doNotPipeOutput: true
            });

            const checkReady = (data: Buffer) => {
                const output = data.toString();
                context.logger.debug(`[Next.js] ${output}`);

                const portMatch = output.match(/localhost:(\d+)/);
                if (portMatch != null) {
                    actualPort = Number(portMatch[1]);
                }

                if (output.includes("Ready in") || output.includes("✓ Ready")) {
                    resolve();
                }
            };
            serverProcess.stdout?.on("data", checkReady);

            // Also log stderr but don't block on it
            serverProcess.stderr?.on("data", (data) => {
                context.logger.debug(`[Next.js] ${data.toString()}`);
            });

            context.logger.debug(`Next.js standalone server started with PID: ${serverProcess.pid}`);

            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            serverProcess.on("error", (err) => {
                context.logger.debug(`Server process error: ${err.message}`);
            });

            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            serverProcess.on("exit", (code, signal) => {
                if (code) {
                    context.logger.debug(`Server process exited with code: ${code}`);
                } else if (signal) {
                    context.logger.debug(`Server process killed with signal: ${signal}`);
                } else {
                    context.logger.debug("Server process exited");
                }
            });

            // Fallback timeout in case we miss the ready message
            setTimeout(() => {
                resolve();
            }, 10000);
        });
    };

    // Start the initial server
    await startNextJsServer();

    // Attach the watcher event handler
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    watcher.on("all", async (event: string, targetPath: string, _targetPathNext: string) => {
        // Ignore changes to .fern/logs/ directory (contains debug logs)
        if (targetPath.includes(".fern/logs/") || targetPath.includes(".fern\\logs\\")) {
            return;
        }

        context.logger.info(chalk.dim(`[${event}] ${targetPath}`));

        if (isReloading) {
            return;
        }

        editedAbsoluteFilepaths.push(AbsoluteFilePath.of(targetPath));

        if (reloadTimer != null) {
            clearTimeout(reloadTimer);
        }

        reloadTimer = setTimeout(() => {
            void (async () => {
                isReloading = true;

                // Expand the list of files to include pages that depend on changed snippets
                const filesToReload = snippetTracker.getFilesToReload(editedAbsoluteFilepaths);
                const hasSnippetDependencies = snippetTracker.hasSnippetDependencies(editedAbsoluteFilepaths);

                if (hasSnippetDependencies) {
                    context.logger.info(
                        `Snippet dependencies detected. Reloading ${filesToReload.length} files (${editedAbsoluteFilepaths.length} changed, ${filesToReload.length - editedAbsoluteFilepaths.length} dependent pages)`
                    );
                }

                sendData({
                    version: 1,
                    type: "startReload"
                });

                const reloadedPreviewResult = await reloadDocsDefinition(filesToReload);

                editedAbsoluteFilepaths.length = 0;

                isReloading = false;

                sendData({
                    version: 1,
                    type: "finishReload"
                });

                if (reloadedPreviewResult != null) {
                    // Detect slug changes before updating the docs definition
                    const slugChanges = slugTracker.updateAndDetectChanges(reloadedPreviewResult.docsDefinition);

                    previewResult = reloadedPreviewResult;

                    // Recompute translated definitions
                    translatedDefinitions = computeTranslatedDefinitions(reloadedPreviewResult);
                    if (translatedDefinitions.size > 0) {
                        context.logger.debug(`Recomputed translations for ${translatedDefinitions.size} locale(s)`);
                    }

                    // Send navigateToSlug events for any slug changes
                    if (slugChanges.length > 0) {
                        slugChanges.forEach((change) => {
                            const eventData = {
                                version: 1,
                                type: "navigateToSlug",
                                oldSlug: change.oldSlug,
                                newSlug: change.newSlug
                            };

                            sendData(eventData);
                        });
                    }
                }
            })();
        }, RELOAD_DEBOUNCE_MS);
    });

    let cleanedUp = false;
    const cleanup = () => {
        if (cleanedUp) {
            return;
        }
        cleanedUp = true;

        if (serverProcess != null && !serverProcess.killed) {
            context.logger.debug(`Killing server process with PID: ${serverProcess.pid}`);
            try {
                serverProcess.kill();
                setTimeout(() => {
                    if (serverProcess != null && !serverProcess.killed) {
                        context.logger.debug(`Force killing server process with PID: ${serverProcess.pid}`);
                        try {
                            serverProcess.kill("SIGKILL");
                        } catch (err) {
                            context.logger.error(`Failed to force kill server process: ${err}`);
                        }
                    }
                }, 2000);
            } catch (err) {
                context.logger.error(`Failed to kill server process: ${err}`);
            }
        }

        killProcessesOnPort(actualPort, context);

        // Clean Fern Docs cache on shutdown (sync since cleanup runs in signal handlers)
        // Uses maxRetries to handle ENOTEMPTY if the server process is still writing
        cleanFernDocsCacheSync(bundleRoot, context);

        context.logger.debug("Cleaning up WebSocket connections...");
        for (const [ws, metadata] of connections) {
            clearInterval(metadata.pingInterval);
            if (ws.readyState === WebSocket.OPEN) {
                ws.close(1000, "Server shutting down");
            }
        }
        connections.clear();
        if (bunServer != null) {
            bunServer.stop();
        } else {
            httpServer.close();
        }
    };

    // handle termination signals
    const shutdownSignals = ["SIGTERM", "SIGINT"];
    const failureSignals = ["SIGHUP"];
    for (const shutSig of shutdownSignals) {
        process.on(shutSig, () => {
            context.logger.debug("Shutting down server...");
            cleanup();
        });
    }
    for (const failSig of failureSignals) {
        process.on(failSig, () => {
            context.logger.debug("Server failed, shutting down process...");
            cleanup();
        });
    }

    process.on("exit", cleanup);

    process.on("uncaughtException", (err) => {
        context.logger.debug(`Uncaught exception: ${err}`);
        cleanup();
        process.exit(1);
    });
    process.on("unhandledRejection", (reason) => {
        context.logger.debug(`Unhandled rejection: ${reason}`);
        cleanup();
        process.exit(1);
    });

    process.on("beforeExit", cleanup);

    // Server is ready after startNextJsServer completes
    context.logger.info(`Docs preview server ready on http://localhost:${port}`);

    // await infinitely
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await new Promise(() => {
        // intentionally empty
    });
}
