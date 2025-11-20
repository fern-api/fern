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

const frontmatterPositionCache = new Map<string, number | undefined>();
const frontmatterNavigationCache = new Map<string, Record<string, unknown>>();

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
    const dbDocsDefinition = convertDocsDefinitionToDb({
        writeShape: writeDocsDefinition,
        files: {}
    });
    const readDocsConfig = convertDbDocsConfigToRead({
        dbShape: dbDocsDefinition.config
    });

    // Clear and repopulate both frontmatter caches
    frontmatterPositionCache.clear();
    frontmatterNavigationCache.clear();

    for (const [pageId, page] of Object.entries(dbDocsDefinition.pages)) {
        if (page.rawMarkdown != null) {
            const absolutePath = AbsoluteFilePath.of(`${docsWorkspace.absoluteFilePath}/${pageId.replace("api/", "")}`);

            // Cache position for backward compatibility
            const position = extractFrontmatterPosition(page.rawMarkdown);
            frontmatterPositionCache.set(absolutePath, position);

            // Cache all navigation-affecting frontmatter properties
            const navigationProperties = extractNavigationAffectingFrontmatter(page.rawMarkdown);
            frontmatterNavigationCache.set(absolutePath, navigationProperties);
        }
    }

    return {
        apis: apiCollector.getAPIsForDefinition(),
        apisV2: apiCollectorV2.getAPIsForDefinition(),
        config: readDocsConfig,
        files: {},
        filesV2,
        pages: dbDocsDefinition.pages,
        jsFiles: dbDocsDefinition.jsFiles,
        id: undefined
    };
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
