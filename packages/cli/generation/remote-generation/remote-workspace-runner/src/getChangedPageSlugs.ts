import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { execSync } from "child_process";
import path from "path";

interface FileSlugMapping {
    filePath: string;
    slug: string | null;
}

interface GetSlugForFileResponse {
    mappings: FileSlugMapping[];
    authed: boolean;
}

async function getSlugForFiles({
    previewUrl,
    files,
    token
}: {
    previewUrl: string;
    files: string[];
    token: string;
}): Promise<GetSlugForFileResponse> {
    const filesParam = files.join(",");
    const url = `https://${previewUrl}/api/fern-docs/get-slug-for-file?files=${encodeURIComponent(filesParam)}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            FERN_TOKEN: token
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get slugs for files: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return (await response.json()) as GetSlugForFileResponse;
}

function getGitRoot(docsWorkspacePath: AbsoluteFilePath): string | undefined {
    try {
        return execSync("git rev-parse --show-toplevel", {
            cwd: docsWorkspacePath,
            encoding: "utf-8"
        }).trim();
    } catch {
        return undefined;
    }
}

function getChangedFilesFromGit(docsWorkspacePath: AbsoluteFilePath): string[] | undefined {
    const gitRoot = getGitRoot(docsWorkspacePath);
    if (gitRoot == null) {
        return undefined;
    }

    // In GitHub Actions PR context, GITHUB_BASE_REF is the target branch
    const baseRef = process.env.GITHUB_BASE_REF;

    try {
        let diffOutput: string;
        if (baseRef != null && baseRef.length > 0) {
            // GitHub Actions: compare against the base branch
            // First, make sure we have the base ref available
            try {
                execSync(`git fetch origin ${baseRef} --depth=1`, {
                    cwd: gitRoot,
                    encoding: "utf-8",
                    stdio: "pipe"
                });
            } catch {
                // fetch may fail if already available or in shallow clone
            }
            diffOutput = execSync(`git diff --name-only origin/${baseRef}...HEAD`, {
                cwd: gitRoot,
                encoding: "utf-8",
                stdio: "pipe"
            });
        } else {
            // Fallback: compare against parent commit
            diffOutput = execSync("git diff --name-only HEAD~1", {
                cwd: gitRoot,
                encoding: "utf-8",
                stdio: "pipe"
            });
        }

        return diffOutput
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
    } catch {
        return undefined;
    }
}

function filterDocsFiles(changedFiles: string[], docsWorkspacePath: AbsoluteFilePath, gitRoot: string): string[] {
    const docsRelative = path.relative(gitRoot, docsWorkspacePath);
    return changedFiles.filter((file) => {
        // Only include files within the docs workspace
        if (!file.startsWith(docsRelative)) {
            return false;
        }
        // Include page files (.mdx, .md) and docs config files
        const ext = path.extname(file).toLowerCase();
        return ext === ".mdx" || ext === ".md" || file.endsWith("docs.yml");
    });
}

/**
 * Detects which docs pages changed and resolves their URL slugs using the preview deployment.
 * Returns an array of slugs for changed pages, or undefined if detection fails.
 *
 * This is best-effort: if git commands fail or slug resolution fails,
 * it returns undefined and the caller should fall back to the base preview URL.
 */
export async function getChangedPageSlugs({
    previewUrl,
    token,
    docsWorkspacePath,
    context
}: {
    previewUrl: string;
    token: string;
    docsWorkspacePath: AbsoluteFilePath;
    context: TaskContext;
}): Promise<string[] | undefined> {
    const gitRoot = getGitRoot(docsWorkspacePath);
    if (gitRoot == null) {
        context.logger.debug("Not a git repository, skipping changed page detection");
        return undefined;
    }

    const allChangedFiles = getChangedFilesFromGit(docsWorkspacePath);
    if (allChangedFiles == null) {
        context.logger.debug("Could not detect changed files from git");
        return undefined;
    }

    const changedDocsFiles = filterDocsFiles(allChangedFiles, docsWorkspacePath, gitRoot);
    if (changedDocsFiles.length === 0) {
        context.logger.debug("No changed docs files detected");
        return undefined;
    }

    context.logger.debug(`Detected ${changedDocsFiles.length} changed docs file(s): ${changedDocsFiles.join(", ")}`);

    // Filter to only page files (.mdx, .md) for slug resolution — docs.yml changes don't map to slugs
    const pageFiles = changedDocsFiles.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ext === ".mdx" || ext === ".md";
    });

    if (pageFiles.length === 0) {
        context.logger.debug("Changed docs files are config-only (no page files), skipping slug resolution");
        return undefined;
    }

    // Normalize file paths to be relative to the fern project directory.
    // Git diff returns paths relative to git root (e.g., "myproject/fern/docs/pages/welcome.mdx"),
    // but the slug resolution API expects paths relative to the fern directory
    // (e.g., "docs/pages/welcome.mdx" or "fern/docs/pages/welcome.mdx").
    const docsRelativeToGitRoot = path.relative(gitRoot, docsWorkspacePath);
    const fernParentRelative = path.dirname(docsRelativeToGitRoot);
    const normalizedPageFiles = pageFiles.map((file) => {
        if (fernParentRelative !== "." && file.startsWith(fernParentRelative + "/")) {
            // Strip everything before the fern directory name
            return file.slice(fernParentRelative.length + 1);
        }
        return file;
    });

    context.logger.debug(`Normalized page files for slug resolution: ${normalizedPageFiles.join(", ")}`);

    try {
        // Normalize the preview URL (strip protocol and path if present)
        let normalizedPreviewUrl = previewUrl;
        if (normalizedPreviewUrl.startsWith("https://")) {
            normalizedPreviewUrl = normalizedPreviewUrl.slice(8);
        } else if (normalizedPreviewUrl.startsWith("http://")) {
            normalizedPreviewUrl = normalizedPreviewUrl.slice(7);
        }
        const slashIndex = normalizedPreviewUrl.indexOf("/");
        if (slashIndex !== -1) {
            normalizedPreviewUrl = normalizedPreviewUrl.slice(0, slashIndex);
        }

        const slugResponse = await getSlugForFiles({
            previewUrl: normalizedPreviewUrl,
            files: normalizedPageFiles,
            token
        });

        const slugs = slugResponse.mappings
            .filter((mapping) => mapping.slug != null)
            .map((mapping) => mapping.slug as string);

        if (slugs.length === 0) {
            context.logger.debug("No slugs resolved for changed page files");
            return undefined;
        }

        return slugs;
    } catch (error) {
        context.logger.debug(
            `Failed to resolve slugs for changed pages: ${error instanceof Error ? error.message : String(error)}`
        );
        return undefined;
    }
}
