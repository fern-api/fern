import { AbsoluteFilePath, dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";

export declare namespace replaceImportsToCustomComponents {
    interface Args {
        markdown: string;
        absolutePathToMarkdownFile: AbsoluteFilePath;
    }
}

export async function replaceImportsToCustomComponents({
    markdown,
    absolutePathToMarkdownFile
}: replaceImportsToCustomComponents.Args): Promise<string> {
    return "";
}

async function inlineImportedComponents(
    { markdown, absolutePathToMarkdownFile }: replaceImportsToCustomComponents.Args,
    visitedFiles: Set<string> = new Set()
): Promise<string> {
    const absolutePathToDirectoryContainingMarkdown = dirname(absolutePathToMarkdownFile);
    const importPattern = /import\s+{([^}]+)}\s+from\s+["'](.*?)["']/g;

    const replaceImport = async (match: string, importPath: string): Promise<string | undefined> => {
        const absoluteImportPath = join(absolutePathToDirectoryContainingMarkdown, RelativeFilePath.of(importPath));

        if (visitedFiles.has(absoluteImportPath)) {
            return;
        }

        try {
            const importedContent = await readFile(absoluteImportPath);
            visitedFiles.add(absoluteImportPath);
            const processedContent = await inlineImportsRecursively(importedContent, absoluteImportPath, visitedFiles);
            visitedFiles.delete(absoluteImportPath);
            return processedContent;
        } catch (error) {}
    };

    let result = markdown;
    let match;
    while ((match = importPattern.exec(content)) !== null) {
        const [fullMatch, importPath] = match;
        const replacement = await replaceImport(fullMatch, importPath);
        result = result.replace(fullMatch, replacement);
    }

    return result;
}

function extractComponent(content: string, componentName: string): string | undefined {
    const pattern = new RegExp(`export\\s+const\\s+${componentName}\\s*=\\s*(?:function\\s*)?[^{]*{([\\s\\S]*?)}`, "g");
    const match = pattern.exec(content);
    return match ? match[0] : undefined;
}
