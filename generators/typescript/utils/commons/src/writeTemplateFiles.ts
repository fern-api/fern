import * as fs from "fs/promises";
import { template } from "lodash-es";
import * as path from "path";

export async function writeTemplateFiles(directory: string, templateVariables: Record<string, unknown>): Promise<void> {
    const templateFiles = await findTemplateFiles(directory);

    for (const templateFile of templateFiles) {
        await processTemplateFile(templateFile, templateVariables);
    }
}

async function findTemplateFiles(directory: string): Promise<string[]> {
    const templateFiles: string[] = [];

    async function walkDirectory(dir: string): Promise<void> {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await walkDirectory(fullPath);
            } else if (entry.isFile() && entry.name.includes(".template.")) {
                templateFiles.push(fullPath);
            }
        }
    }

    await walkDirectory(directory);
    return templateFiles;
}

async function processTemplateFile(
    templateFilePath: string,
    templateVariables: Record<string, unknown>
): Promise<void> {
    const templateContent = await fs.readFile(templateFilePath, "utf8");
    const compiledTemplate = template(templateContent);
    const content = compiledTemplate(templateVariables);
    const outputFilePath = templateFilePath.replace(/\.template\./, ".");
    await fs.writeFile(outputFilePath, content, "utf8");
    await fs.unlink(templateFilePath);
}
