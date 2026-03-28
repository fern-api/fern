import { Eta } from "eta";
import type { Volume } from "memfs/lib/volume";
import * as path from "path";

const eta = new Eta({ autoEscape: false, useWith: true, autoTrim: false });

/**
 * Processes .template. files in-memory inside a memfs Volume.
 * Renders each template with Eta, writes the output to the non-template filename,
 * and removes the original .template. file from the Volume.
 *
 * This must run BEFORE fixImportsInVolume so that the rendered .ts files
 * (e.g. getFetchFn.ts from getFetchFn.template.ts) are visible in the
 * file existence cache.
 */
export function writeTemplateFilesToVolume(volume: Volume, templateVariables: Record<string, unknown>): void {
    const templateFiles: string[] = [];
    collectTemplateFilesSync(volume, "/", templateFiles);

    for (const templateFilePath of templateFiles) {
        const contentBuf = volume.readFileSync(templateFilePath, "utf-8");
        const templateContent = typeof contentBuf === "string" ? contentBuf : contentBuf.toString();
        const content = eta.renderString(templateContent, templateVariables);
        const outputFilePath = templateFilePath.replace(/\.template\./, ".");
        volume.writeFileSync(outputFilePath, content);
        volume.unlinkSync(templateFilePath);
    }
}

function collectTemplateFilesSync(volume: Volume, dir: string, files: string[]): void {
    const entries = volume.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const dirent = entry as { name: string | Buffer; isDirectory(): boolean };
        const name = typeof dirent.name === "string" ? dirent.name : dirent.name.toString();
        const fullPath = path.join(dir, name);
        if (dirent.isDirectory()) {
            collectTemplateFilesSync(volume, fullPath, files);
        } else if (name.includes(".template.")) {
            files.push(fullPath);
        }
    }
}
