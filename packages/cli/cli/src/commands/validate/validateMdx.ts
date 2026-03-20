import { getAllPages, parseDocsConfiguration } from "@fern-api/configuration-loader";
import { parseMarkdownToTree } from "@fern-api/docs-markdown-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { readFileSync } from "fs";
import grayMatter from "gray-matter";

interface MdxValidationError {
    filepath: AbsoluteFilePath;
    error: string;
}

export async function validateMdxFiles({
    workspace,
    context
}: {
    workspace: DocsWorkspace;
    context: TaskContext;
}): Promise<{ errors: MdxValidationError[]; totalFiles: number }> {
    const errors: MdxValidationError[] = [];

    const parsedConfig = await parseDocsConfiguration({
        rawDocsConfiguration: workspace.config,
        absolutePathToFernFolder: workspace.absoluteFilePath,
        absoluteFilepathToDocsConfig: workspace.absoluteFilepathToDocsConfig,
        context
    });

    const allPages = getAllPages({
        landingPage: parsedConfig.landingPage,
        navigation: parsedConfig.navigation
    });

    // Deduplicate files (pages can appear multiple times in navigation)
    const filesToCheck = Array.from(new Set(allPages));

    for (const filepath of filesToCheck) {
        const content = readFileSync(filepath, "utf-8");

        try {
            parseMarkdownToTree(content);
        } catch (error) {
            const { content: contentWithoutFrontmatter } = grayMatter(content);
            const totalLines = content.split("\n").length;
            const contentLines = contentWithoutFrontmatter.split("\n").length;
            const frontmatterLineCount = totalLines - contentLines;

            let errorMessage = error instanceof Error ? error.message : String(error);

            if (error && typeof error === "object") {
                const errorObj = error as {
                    place?: { line?: number; column?: number };
                    position?: { start?: { line?: number; column?: number } };
                };
                if (errorObj.place?.line != null && errorObj.place?.column != null) {
                    const adjustedLine = errorObj.place.line + frontmatterLineCount;
                    errorMessage = `${adjustedLine}:${errorObj.place.column} ${errorMessage}`;
                } else if (errorObj.position?.start?.line != null && errorObj.position?.start?.column != null) {
                    const adjustedLine = errorObj.position.start.line + frontmatterLineCount;
                    errorMessage = `${adjustedLine}:${errorObj.position.start.column} ${errorMessage}`;
                }
            }

            errors.push({
                filepath,
                error: errorMessage
            });
        }
    }

    return { errors, totalFiles: filesToCheck.length };
}

function extractLineColumn(error: string): { line?: number; column?: number } {
    const match = error.match(/(?:at )?(\d+):(\d+)/);
    if (match && match[1] && match[2]) {
        return {
            line: parseInt(match[1], 10),
            column: parseInt(match[2], 10)
        };
    }
    return {};
}

function formatErrorWithContext(filepath: AbsoluteFilePath, error: string): string {
    const { line, column } = extractLineColumn(error);

    let formatted = chalk.red(`\n  ${filepath}`);

    if (line != null) {
        formatted += chalk.yellow(`:${line}`);
        if (column != null) {
            formatted += chalk.yellow(`:${column}`);
        }
    }

    let cleanError = error;
    cleanError = cleanError.replace(/\s*at \d+:\d+/, "");
    cleanError = cleanError.replace(/^\d+:\d+\s*/, "");

    formatted += chalk.gray(`\n    ${cleanError}`);

    return formatted;
}

export function logMdxValidationResults({
    errors,
    totalFiles,
    context
}: {
    errors: MdxValidationError[];
    totalFiles: number;
    context: TaskContext;
}): void {
    if (errors.length === 0) {
        context.logger.info(chalk.green(`\n✓ All ${totalFiles} MDX files are valid`));
        return;
    }

    for (const { filepath, error } of errors) {
        context.logger.error(formatErrorWithContext(filepath, error));
    }

    context.logger.error("");
}
