import { DocsDefinitionResolver, filterOssWorkspaces } from "@fern-api/docs-resolver";
import {
    APIV1Read,
    APIV1Write,
    convertAPIDefinitionToDb,
    convertDbAPIDefinitionToRead,
    convertDbDocsConfigToRead,
    convertDocsDefinitionToDb,
    DocsV1Read,
    FdrAPI,
    FernNavigation,
    SDKSnippetHolder
} from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, convertToFernHostAbsoluteFilePath, doesPathExist, relative } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { Project } from "@fern-api/project-loader";
import { convertIrToFdrApi } from "@fern-api/register";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import grayMatter from "gray-matter";
import { v4 as uuidv4 } from "uuid";

import {
    parseImagePaths,
    replaceImagePathsAndUrls,
    replaceReferencedCode,
    replaceReferencedMarkdown
} from "../../docs-markdown-utils/src";

// Caches for hot reload change detection: frontmatter properties and resolved slugs
const frontmatterPositionCache = new Map<string, number | undefined>();
const frontmatterNavigationCache = new Map<string, Record<string, unknown>>();
const resolvedSlugsCache = new Map<string, string>(); // Main cache: final resolved slugs
// Track all page nodes by their unique navigation node IDs
const pageNodeSlugsCache = new Map<string, string>();
const previousPageNodeSlugsCache = new Map<string, string>();

/**
 * Exported caches for external slug change detection
 */
export { frontmatterNavigationCache, resolvedSlugsCache };

/**
 * Properties in frontmatter that, when changed, require a full refresh
 * because they affect the navigation structure or page organization.
 */
const NAVIGATION_AFFECTING_FRONTMATTER_PROPERTIES = ["sidebar-title", "position", "slug", "noindex", "tags"] as const;

/**
 * Extracts and normalizes the position field from markdown frontmatter.
 * Returns a finite number if position is valid, undefined otherwise.
 * Matches the logic in navigationUtils.ts getFrontmatterPosition.
 */
function extractFrontmatterPosition(markdown: string): number | undefined {
    try {
        const { data } = grayMatter(markdown);

        if (data.position == null) {
            return undefined;
        }

        const position = typeof data.position === "string" ? parseFloat(data.position) : data.position;

        if (typeof position === "number" && Number.isFinite(position)) {
            return position;
        }

        return undefined;
    } catch {
        return undefined;
    }
}

/**
 * Extracts navigation-affecting properties from markdown frontmatter.
 * Returns an object with the relevant properties for navigation comparison.
 */
function extractNavigationAffectingFrontmatter(markdown: string): Record<string, unknown> {
    try {
        const { data } = grayMatter(markdown);
        const relevantProperties: Record<string, unknown> = {};

        for (const property of NAVIGATION_AFFECTING_FRONTMATTER_PROPERTIES) {
            if (data[property] != null) {
                relevantProperties[property] = data[property];
            }
        }

        return relevantProperties;
    } catch {
        return {};
    }
}

/**
 * Compares two frontmatter objects to detect navigation-affecting changes.
 * Returns true if any navigation-affecting property has changed.
 */
function hasNavigationAffectingFrontmatterChanged(
    previousProperties: Record<string, unknown>,
    currentProperties: Record<string, unknown>
): boolean {
    // Check if any navigation-affecting properties changed
    for (const property of NAVIGATION_AFFECTING_FRONTMATTER_PROPERTIES) {
        const previousValue = previousProperties[property];
        const currentValue = currentProperties[property];

        // Deep comparison for the values
        if (JSON.stringify(previousValue) !== JSON.stringify(currentValue)) {
            return true;
        }
    }

    return false;
}

// Extracts already-resolved slugs from navigation structure
function extractResolvedSlugsFromNavigation(
    navigation: FernNavigation.V1.NavigationNode,
    docsWorkspacePath: AbsoluteFilePath,
    slugMap: Map<string, string> = new Map()
): Map<string, string> {
    switch (navigation.type) {
        case "page":
            if (navigation.pageId && navigation.slug && navigation.id) {
                // Convert pageId to absolute path for consistency
                const cleanPageId = navigation.pageId.replace("api/", "");
                const absolutePath = AbsoluteFilePath.of(`${docsWorkspacePath}/${cleanPageId}`);

                // Track slugs by navigation node ID to handle duplicates properly
                pageNodeSlugsCache.set(navigation.id, navigation.slug);

                // For the main slug map, use the absolute path - last one wins for file-based tracking
                slugMap.set(absolutePath, navigation.slug);
            }
            break;
        case "section":
        case "sidebarRoot":
        case "sidebarGroup":
        case "productgroup":
        case "versioned":
            if (navigation.children) {
                for (const child of navigation.children) {
                    extractResolvedSlugsFromNavigation(child, docsWorkspacePath, slugMap);
                }
            }
            break;
        case "root":
        case "unversioned":
            if (navigation.child) {
                extractResolvedSlugsFromNavigation(navigation.child, docsWorkspacePath, slugMap);
            }
            break;
        case "apiReference":
            // API reference might have different structure, skip for now
            break;
        default:
            break;
    }

    return slugMap;
}

// Compares resolved slugs to detect if exactly one page's slug changed
function checkForResolvedSlugOnlyChange(
    currentSlugs: Map<string, string>,
    editedAbsoluteFilepaths: AbsoluteFilePath[]
): { oldSlug: string | undefined; newSlug: string | undefined; filePath: string } | null {
    const changedSlugs = new Map<string, { oldSlug: string | undefined; newSlug: string | undefined }>();

    // Find changed slugs
    for (const [filePath, newSlug] of currentSlugs) {
        const oldSlug = resolvedSlugsCache.get(filePath);
        if (oldSlug !== newSlug) {
            changedSlugs.set(filePath, { oldSlug, newSlug });
        }
    }

    // Check for removed pages
    for (const [filePath, oldSlug] of resolvedSlugsCache) {
        if (!currentSlugs.has(filePath)) {
            changedSlugs.set(filePath, { oldSlug, newSlug: undefined });
        }
    }

    // Only proceed if exactly one slug changed
    if (changedSlugs.size !== 1) {
        return null;
    }

    const [filePath, { oldSlug, newSlug }] = Array.from(changedSlugs)[0]!;

    // Allow navigation for YAML or markdown changes
    const isNavigationYamlChange = editedAbsoluteFilepaths.some(
        (path) => path.endsWith("docs.yml") || path.endsWith("nav.yml")
    );
    const isMarkdownFileChange = editedAbsoluteFilepaths.some((path) => path.endsWith(".md") || path.endsWith(".mdx"));

    if (isNavigationYamlChange || isMarkdownFileChange) {
        return { oldSlug, newSlug, filePath };
    }

    return null;
}

// Legacy frontmatter-only check for optimization. Main logic is in checkForSlugOnlyChangeAfterReload()
export async function checkForSlugOnlyChange(
    editedAbsoluteFilepaths: AbsoluteFilePath[]
): Promise<{ oldSlug: string | undefined; newSlug: string | undefined } | null> {
    // Only handle single file changes for potential slug navigation optimization
    if (editedAbsoluteFilepaths.length !== 1) {
        return null;
    }

    const filePath = editedAbsoluteFilepaths[0];
    if (filePath == null) {
        return null;
    }

    // Only check markdown files for frontmatter slug changes
    if (filePath.endsWith(".md") || filePath.endsWith(".mdx")) {
        try {
            if (!(await doesPathExist(filePath))) {
                return null;
            }

            const currentMarkdown = (await readFile(filePath)).toString();
            const currentProperties = extractNavigationAffectingFrontmatter(currentMarkdown);
            const previousProperties = frontmatterNavigationCache.get(filePath) ?? {};

            // Check if only frontmatter slug changed
            const currentSlug = currentProperties.slug as string | undefined;
            const previousSlug = previousProperties.slug as string | undefined;

            if (currentSlug !== previousSlug) {
                // Verify no other properties changed
                const currentWithoutSlug = { ...currentProperties };
                const previousWithoutSlug = { ...previousProperties };
                delete currentWithoutSlug.slug;
                delete previousWithoutSlug.slug;

                if (!hasNavigationAffectingFrontmatterChanged(previousWithoutSlug, currentWithoutSlug)) {
                    // Return raw frontmatter values - resolved slugs checked later
                    return {
                        oldSlug: previousSlug,
                        newSlug: currentSlug
                    };
                }
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    return null;
}

// Check for slug changes at the navigation node level
function checkForNodeSlugOnlyChange(
    editedAbsoluteFilepaths: AbsoluteFilePath[]
): { oldSlug: string | undefined; newSlug: string | undefined } | null {
    const changedNodes = new Map<string, { oldSlug: string; newSlug: string }>();

    // Compare previous vs current node slugs
    for (const [nodeId, currentSlug] of pageNodeSlugsCache) {
        const previousSlug = previousPageNodeSlugsCache.get(nodeId);
        if (previousSlug && previousSlug !== currentSlug) {
            changedNodes.set(nodeId, { oldSlug: previousSlug, newSlug: currentSlug });
        }
    }

    // Check for nodes that disappeared
    for (const [nodeId, previousSlug] of previousPageNodeSlugsCache) {
        if (!pageNodeSlugsCache.has(nodeId)) {
            changedNodes.set(nodeId, { oldSlug: previousSlug, newSlug: "" });
        }
    }

    // Only proceed if exactly one node changed
    if (changedNodes.size !== 1) {
        return null;
    }

    const [nodeId, { oldSlug, newSlug }] = Array.from(changedNodes)[0]!;

    // Allow navigation for YAML or markdown changes
    const isNavigationYamlChange = editedAbsoluteFilepaths.some(
        (path) => path.endsWith("docs.yml") || path.endsWith("nav.yml")
    );
    const isMarkdownFileChange = editedAbsoluteFilepaths.some((path) => path.endsWith(".md") || path.endsWith(".mdx"));

    if (isNavigationYamlChange || isMarkdownFileChange) {
        return { oldSlug, newSlug };
    }

    return null;
}

// Main slug detection using deterministic resolved slugs (works for all slug sources)
export function checkForSlugOnlyChangeAfterReload(
    newDefinition: DocsV1Read.DocsDefinition,
    navigationNode: FernNavigation.V1.NavigationNode,
    docsWorkspacePath: AbsoluteFilePath,
    editedAbsoluteFilepaths: AbsoluteFilePath[]
): { oldSlug: string | undefined; newSlug: string | undefined } | null {
    // Copy current node cache to previous before extracting new ones
    previousPageNodeSlugsCache.clear();
    for (const [nodeId, slug] of pageNodeSlugsCache) {
        previousPageNodeSlugsCache.set(nodeId, slug);
    }

    // Clear and rebuild current node cache
    pageNodeSlugsCache.clear();

    // Extract resolved slugs from the navigation node
    const currentSlugs = extractResolvedSlugsFromNavigation(navigationNode, docsWorkspacePath);

    // First try node-level slug change detection
    const nodeResult = checkForNodeSlugOnlyChange(editedAbsoluteFilepaths);
    if (nodeResult) {
        // Update cache with current slugs after comparison
        resolvedSlugsCache.clear();
        for (const [filePath, slug] of currentSlugs) {
            resolvedSlugsCache.set(filePath, slug);
        }

        return {
            oldSlug: nodeResult.oldSlug,
            newSlug: nodeResult.newSlug
        };
    }

    // Fallback to file-level comparison
    const result = checkForResolvedSlugOnlyChange(currentSlugs, editedAbsoluteFilepaths);

    // Update cache with current slugs after comparison
    resolvedSlugsCache.clear();
    for (const [filePath, slug] of currentSlugs) {
        resolvedSlugsCache.set(filePath, slug);
    }

    if (result) {
        return {
            oldSlug: result.oldSlug,
            newSlug: result.newSlug
        };
    }

    return null;
}

// Store navigation node for slug change detection
let cachedNavigationNode: FernNavigation.V1.NavigationNode | null = null;

// Wrapper function that uses cached navigation node
export function checkForSlugOnlyChangeAfterReloadFromDefinition(
    newDefinition: DocsV1Read.DocsDefinition,
    docsWorkspacePath: AbsoluteFilePath,
    editedAbsoluteFilepaths: AbsoluteFilePath[]
): { oldSlug: string | undefined; newSlug: string | undefined } | null {
    if (!cachedNavigationNode) {
        return null; // No navigation available for slug detection
    }

    return checkForSlugOnlyChangeAfterReload(
        newDefinition,
        cachedNavigationNode,
        docsWorkspacePath,
        editedAbsoluteFilepaths
    );
}

export async function getPreviewDocsDefinition({
    domain,
    project,
    context,
    previousDocsDefinition,
    editedAbsoluteFilepaths
}: {
    domain: string;
    project: Project;
    context: TaskContext;
    previousDocsDefinition?: DocsV1Read.DocsDefinition;
    editedAbsoluteFilepaths?: AbsoluteFilePath[];
}): Promise<DocsV1Read.DocsDefinition> {
    const docsWorkspace = project.docsWorkspaces;
    const apiWorkspaces = project.apiWorkspaces;
    if (docsWorkspace == null) {
        throw new Error("No docs workspace found in project");
    }

    if (editedAbsoluteFilepaths != null && previousDocsDefinition != null) {
        const allMarkdownFiles = editedAbsoluteFilepaths.every(
            (filepath) => filepath.endsWith(".mdx") || filepath.endsWith(".md")
        );
        let navAffectingChange = false;

        for (const absoluteFilePath of editedAbsoluteFilepaths) {
            const relativePath = relative(docsWorkspace.absoluteFilePath, absoluteFilePath);
            const pageId = FdrAPI.PageId(relativePath);
            const previousValue = previousDocsDefinition.pages[pageId];

            if (!(await doesPathExist(absoluteFilePath))) {
                navAffectingChange = true;
                continue;
            }

            const markdown = (await readFile(absoluteFilePath)).toString();

            const isNewFile = previousValue == null;
            if (isNewFile) {
                navAffectingChange = true;
            }

            // Check for navigation-affecting frontmatter changes (including sidebar-title)
            const currentNavigationProperties = extractNavigationAffectingFrontmatter(markdown);
            const cachedNavigationProperties = frontmatterNavigationCache.get(absoluteFilePath) ?? {};

            if (hasNavigationAffectingFrontmatterChanged(cachedNavigationProperties, currentNavigationProperties)) {
                navAffectingChange = true;
            }

            // Update both caches
            frontmatterNavigationCache.set(absoluteFilePath, currentNavigationProperties);
            const currentPosition = extractFrontmatterPosition(markdown);
            frontmatterPositionCache.set(absoluteFilePath, currentPosition);

            if (isNewFile) {
                continue;
            }

            const markdownReplacedMd = await replaceReferencedMarkdown({
                markdown,
                absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
                absolutePathToMarkdownFile: absoluteFilePath,
                context
            });

            const markdownReplacedMdAndCode = await replaceReferencedCode({
                markdown: markdownReplacedMd,
                absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
                absolutePathToMarkdownFile: absoluteFilePath,
                context
            });

            const { markdown: markdownWithAbsPaths, filepaths } = parseImagePaths(markdownReplacedMdAndCode, {
                absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
                absolutePathToMarkdownFile: absoluteFilePath
            });

            if (previousDocsDefinition.filesV2 == null) {
                previousDocsDefinition.filesV2 = {};
            }

            const fileIdsMap = new Map(
                Object.entries(previousDocsDefinition.filesV2).map(([id, file]) => {
                    const path = "/" + file.url.replace("/_local/", "");
                    return [AbsoluteFilePath.of(path), id];
                })
            );

            for (const filepath of filepaths) {
                if (!fileIdsMap.has(filepath)) {
                    const fileId = FdrAPI.FileId(uuidv4());
                    previousDocsDefinition.filesV2[fileId] = {
                        type: "url",
                        url: FernNavigation.Url(`/_local${convertToFernHostAbsoluteFilePath(filepath)}`)
                    };
                    fileIdsMap.set(filepath, fileId);
                }
            }

            // Then replace image paths with file IDs
            const finalMarkdown = replaceImagePathsAndUrls(
                markdownWithAbsPaths,
                fileIdsMap,
                {}, // markdownFilesToPathName - empty object since we don't need it for images
                {
                    absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
                    absolutePathToMarkdownFile: absoluteFilePath
                },
                context
            );

            previousDocsDefinition.pages[pageId] = {
                markdown: finalMarkdown,
                editThisPageUrl: previousValue.editThisPageUrl,
                rawMarkdown: markdown
            };
        }

        if (allMarkdownFiles && !navAffectingChange) {
            return previousDocsDefinition;
        }
    }

    const ossWorkspaces = await filterOssWorkspaces(project);

    const apiCollector = new ReferencedAPICollector(context);
    const apiCollectorV2 = new ReferencedAPICollectorV2(context);

    const filesV2: Record<string, DocsV1Read.File_> = {};

    const resolver = new DocsDefinitionResolver({
        domain,
        docsWorkspace,
        ossWorkspaces,
        apiWorkspaces,
        taskContext: context,
        editThisPage: undefined,
        uploadFiles: async (files) =>
            files.map((file) => {
                const fileId = uuidv4();
                filesV2[fileId] = {
                    type: "url",
                    url: FernNavigation.Url(`/_local${convertToFernHostAbsoluteFilePath(file.absoluteFilePath)}`)
                };
                return {
                    absoluteFilePath: file.absoluteFilePath,
                    relativeFilePath: file.relativeFilePath,
                    fileId
                };
            }),
        registerApi: async (opts) => apiCollector.addReferencedAPI(opts),
        targetAudiences: undefined
    });

    const writeDocsDefinition = await resolver.resolve();

    // Cache navigation node if available in writeDocsDefinition
    if ((writeDocsDefinition as any).rootNode) {
        cachedNavigationNode = (writeDocsDefinition as any).rootNode;
    } else if ((writeDocsDefinition as any).root) {
        cachedNavigationNode = (writeDocsDefinition as any).root;
    } else if ((writeDocsDefinition as any).config?.root) {
        cachedNavigationNode = (writeDocsDefinition as any).config.root;
    } else if ((writeDocsDefinition as any).navigation) {
        cachedNavigationNode = (writeDocsDefinition as any).navigation;
    } else {
        cachedNavigationNode = null;
    }

    const dbDocsDefinition = convertDocsDefinitionToDb({
        writeShape: writeDocsDefinition,
        files: {}
    });
    const readDocsConfig = convertDbDocsConfigToRead({
        dbShape: dbDocsDefinition.config
    });

    // Build the final result
    const result = {
        apis: apiCollector.getAPIsForDefinition(),
        apisV2: apiCollectorV2.getAPIsForDefinition(),
        config: readDocsConfig,
        files: {},
        filesV2,
        pages: dbDocsDefinition.pages,
        jsFiles: dbDocsDefinition.jsFiles,
        id: undefined
    };

    // Clear and repopulate caches
    frontmatterPositionCache.clear();
    frontmatterNavigationCache.clear();

    // Initialize resolved slugs cache on first run
    if (resolvedSlugsCache.size === 0 && cachedNavigationNode) {
        const initialSlugs = extractResolvedSlugsFromNavigation(cachedNavigationNode, docsWorkspace.absoluteFilePath);
        for (const [filePath, slug] of initialSlugs) {
            resolvedSlugsCache.set(filePath, slug);
        }
    }

    for (const [pageId, page] of Object.entries(dbDocsDefinition.pages)) {
        if (page.rawMarkdown != null) {
            const absolutePath = AbsoluteFilePath.of(`${docsWorkspace.absoluteFilePath}/${pageId.replace("api/", "")}`);

            const position = extractFrontmatterPosition(page.rawMarkdown);
            frontmatterPositionCache.set(absolutePath, position);

            const navigationProperties = extractNavigationAffectingFrontmatter(page.rawMarkdown);
            frontmatterNavigationCache.set(absolutePath, navigationProperties);
        }
    }

    return result;
}

type APIDefinitionID = string;

class ReferencedAPICollector {
    private readonly apis: Record<APIDefinitionID, APIV1Read.ApiDefinition> = {};

    constructor(private readonly context: TaskContext) {}

    public addReferencedAPI({
        ir,
        snippetsConfig,
        playgroundConfig
    }: {
        ir: IntermediateRepresentation;
        snippetsConfig: APIV1Write.SnippetsConfig;
        playgroundConfig?: { oauth?: boolean };
    }): APIDefinitionID {
        try {
            const id = uuidv4();

            const dbApiDefinition = convertAPIDefinitionToDb(
                convertIrToFdrApi({ ir, snippetsConfig, playgroundConfig, context: this.context }),
                FdrAPI.ApiDefinitionId(id),
                new SDKSnippetHolder({
                    snippetsConfigWithSdkId: {},
                    snippetsBySdkId: {},
                    snippetTemplatesByEndpoint: {},
                    snippetTemplatesByEndpointId: {},
                    snippetsBySdkIdAndEndpointId: {}
                })
            );

            const readApiDefinition = convertDbAPIDefinitionToRead(dbApiDefinition);

            this.apis[id] = readApiDefinition;
            return id;
        } catch (e) {
            // Print Error
            const err = e as Error;
            this.context.logger.debug(`Failed to read referenced API: ${err?.message} ${err?.stack}`);
            this.context.logger.error(
                "An error occurred while trying to read an API definition. Please reach out to support."
            );
            if (err.stack != null) {
                this.context.logger.error(err?.stack);
            }
            throw e;
        }
    }

    public getAPIsForDefinition(): Record<FdrAPI.ApiDefinitionId, APIV1Read.ApiDefinition> {
        return this.apis;
    }
}

class ReferencedAPICollectorV2 {
    private readonly apis: Record<APIDefinitionID, FdrAPI.api.latest.ApiDefinition> = {};

    constructor(private readonly context: TaskContext) {}

    public addReferencedAPI({
        api,
        snippetsConfig
    }: {
        api: FdrAPI.api.latest.ApiDefinition;
        snippetsConfig: APIV1Write.SnippetsConfig;
    }): APIDefinitionID {
        try {
            api.snippetsConfiguration = snippetsConfig;
            this.apis[api.id] = api;
            return api.id;
        } catch (e) {
            // Print Error
            const err = e as Error;
            this.context.logger.debug(`Failed to read referenced API: ${err?.message} ${err?.stack}`);
            this.context.logger.error(
                "An error occurred while trying to read an API definition. Please reach out to support."
            );
            if (err.stack != null) {
                this.context.logger.error(err?.stack);
            }
            throw e;
        }
    }

    public getAPIsForDefinition(): Record<FdrAPI.ApiDefinitionId, FdrAPI.api.latest.ApiDefinition> {
        return this.apis;
    }
}
