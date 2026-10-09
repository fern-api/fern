import { AbsoluteFilePath, dirname, doesPathExist, listFiles, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";

/**
 * Dependency tracking system for markdown snippets
 */
export class SnippetDependencyTracker {
    // Map: snippet file path -> Set of page files that reference it
    private snippetToPages = new Map<string, Set<string>>();
    // Map: page file path -> Set of snippet files it references
    private pageToSnippets = new Map<string, Set<string>>();
    // Whether a full scan has populated the maps at least once.
    private hasBuiltInitialMap = false;

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

                    // Update page -> snippets (forward) mapping
                    this.pageToSnippets.set(markdownFile, referencedFiles);
                } catch (error) {
                    this.context.logger.debug(`Failed to read markdown file ${markdownFile}: ${error}`);
                }
            }

            // Derive the snippet -> pages (reverse) mapping from the forward mapping.
            this.rebuildReverseMap();
            this.hasBuiltInitialMap = true;

            this.context.logger.debug(
                `Built dependency map: ${this.snippetToPages.size} snippets, ${this.pageToSnippets.size} pages`
            );
        } catch (error) {
            this.context.logger.debug(`Failed to build dependency map: ${error}`);
        }
    }

    /**
     * Incrementally updates the dependency maps for a set of changed markdown files,
     * avoiding a full re-scan of every page in the workspace.
     *
     * Only content-only (`.md`/`.mdx`) reloads take this path. For each changed file we
     * re-read it and recompute its outgoing references (the page -> snippets forward
     * edge); deleted files are dropped. We then rebuild the snippet -> pages reverse
     * map from the forward map in memory (no disk I/O), so the reverse map is always
     * fully consistent with the forward map and can never accumulate stale edges.
     *
     * Reloads never overlap (the watcher handler serializes them behind `isReloading`),
     * so these mutations are not subject to concurrent access. Falls back to a full
     * scan if an initial map has not been built yet.
     */
    async updateDependencyMapForFiles(changedFiles: AbsoluteFilePath[], project: Project): Promise<void> {
        const docsWorkspace = project.docsWorkspaces;
        if (!docsWorkspace) {
            return;
        }

        if (!this.hasBuiltInitialMap) {
            await this.buildDependencyMap(project);
            return;
        }

        for (const changedFile of changedFiles) {
            const lower = changedFile.toLowerCase();
            if (!lower.endsWith(".md") && !lower.endsWith(".mdx")) {
                // Non-markdown files are never keys in the forward map. Changing a
                // referenced snippet's *content* does not alter the dependency graph
                // (the reverse edge keyed by the snippet path is unaffected), so there
                // is nothing to update here.
                continue;
            }

            if (!(await doesPathExist(changedFile))) {
                // Deleted page: drop its forward edge. The reverse map is rebuilt below.
                this.pageToSnippets.delete(changedFile);
                continue;
            }

            try {
                const content = await readFile(changedFile, "utf-8");
                const referencedFiles = this.extractReferences(content, changedFile, docsWorkspace.absoluteFilePath);
                this.pageToSnippets.set(changedFile, referencedFiles);
            } catch (error) {
                this.context.logger.debug(`Failed to read markdown file ${changedFile}: ${error}`);
                // Drop a stale forward edge for a now-unreadable file so the reverse map
                // does not retain references that may no longer be accurate.
                this.pageToSnippets.delete(changedFile);
            }
        }

        this.rebuildReverseMap();
    }

    /**
     * Rebuilds the snippet -> pages (reverse) map from the page -> snippets (forward)
     * map. A pure in-memory transformation, so it can never leave stale reverse edges.
     */
    private rebuildReverseMap(): void {
        this.snippetToPages.clear();
        for (const [page, references] of this.pageToSnippets) {
            for (const reference of references) {
                let pages = this.snippetToPages.get(reference);
                if (pages == null) {
                    pages = new Set();
                    this.snippetToPages.set(reference, pages);
                }
                pages.add(page);
            }
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
