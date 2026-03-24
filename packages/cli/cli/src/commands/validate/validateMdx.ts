import { getAllPages, parseDocsConfiguration } from "@fern-api/configuration-loader";
import { parseMarkdownToTree } from "@fern-api/docs-markdown-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { readFileSync } from "fs";
import grayMatter from "gray-matter";
import path from "path";

class MdxValidationError {
    constructor(
        public readonly filepath: AbsoluteFilePath,
        public readonly message: string,
        public readonly line?: number,
        public readonly column?: number
    ) {}

    toString(): string {
        const relativePath = path.relative(process.cwd(), this.filepath);
        let formatted = chalk.red(`\n  ${relativePath}`);

        if (this.line != null) {
            formatted += chalk.yellow(`:${this.line}`);
            if (this.column != null) {
                formatted += chalk.yellow(`:${this.column}`);
            }
        }

        formatted += chalk.gray(`\n    ${this.message}`);

        return formatted;
    }
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

            const message = error instanceof Error ? error.message : String(error);
            let line: number | undefined;
            let column: number | undefined;

            if (error && typeof error === "object") {
                const errorObj = error as {
                    line?: number;
                    column?: number;
                    place?: { line?: number; column?: number };
                    position?: { start?: { line?: number; column?: number } };
                };

                if (errorObj.line != null) {
                    line = errorObj.line + frontmatterLineCount;
                    column = errorObj.column;
                } else if (errorObj.place?.line != null) {
                    line = errorObj.place.line + frontmatterLineCount;
                    column = errorObj.place.column;
                } else if (errorObj.position?.start?.line != null) {
                    line = errorObj.position.start.line + frontmatterLineCount;
                    column = errorObj.position.start.column;
                }
            }

            errors.push(new MdxValidationError(filepath, message, line, column));
        }
    }

    return { errors, totalFiles: filesToCheck.length };
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

    for (const error of errors) {
        context.logger.error(error.toString());
    }

    context.logger.error("");
}
