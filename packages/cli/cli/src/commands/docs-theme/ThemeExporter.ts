import { isURL } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { copyFile, mkdir, readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

const THEME_ELIGIBLE_KEYS = new Set([
    "logo",
    "favicon",
    "colors",
    "typography",
    "layout",
    "navbar-links",
    "footer-links",
    "background-image",
    "theme",
    "css",
    "js",
    "header",
    "footer",
    "metadata"
]);

export class ThemeExporter {
    public constructor(private readonly docsWorkspace: DocsWorkspace) {}

    public async export({ output, context }: { output?: string; context: TaskContext }): Promise<void> {
        const docsYmlPath = this.docsWorkspace.absoluteFilepathToDocsConfig;
        const docsDir = path.dirname(docsYmlPath);
        const outDir =
            output != null
                ? path.resolve(process.cwd(), output)
                : path.join(this.docsWorkspace.absoluteFilePath, "theme");

        context.logger.info(`Exporting theme-eligible fields from docs.yml → ${outDir}`);

        const raw = yaml.load(await readFile(docsYmlPath, "utf-8")) as Record<string, unknown>;
        const themeConfig: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(raw)) {
            if (THEME_ELIGIBLE_KEYS.has(k)) {
                themeConfig[k] = v;
            }
        }

        await mkdir(outDir, { recursive: true });
        const assetsDir = path.join(outDir, "assets");
        await mkdir(assetsDir, { recursive: true });

        const exported = await copyLocalFiles(themeConfig, docsDir, assetsDir);

        await writeFile(path.join(outDir, "theme.yml"), yaml.dump(exported), "utf-8");

        context.logger.info(`Theme exported to ${outDir}/theme.yml`);
    }
}

async function copyLocalFiles(obj: unknown, sourceDir: string, assetsDir: string): Promise<unknown> {
    if (obj === null || typeof obj !== "object") {
        if (typeof obj === "string" && !isURL(obj)) {
            const abs = path.resolve(sourceDir, obj);
            const relFromSource = path.relative(sourceDir, abs);
            const projectRoot = path.dirname(sourceDir);
            const relFromProject = path.relative(projectRoot, abs);
            const destRelative = relFromSource.startsWith("..")
                ? relFromProject.startsWith("..")
                    ? path.basename(abs)
                    : relFromProject
                : relFromSource;
            const dest = path.join(assetsDir, destRelative);
            try {
                await mkdir(path.dirname(dest), { recursive: true });
                await copyFile(abs, dest);
                return `./assets/${destRelative.split(path.sep).join("/")}`;
            } catch {
                return obj;
            }
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        return Promise.all(obj.map((el) => copyLocalFiles(el, sourceDir, assetsDir)));
    }

    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        result[k] = await copyLocalFiles(v, sourceDir, assetsDir);
    }
    return result;
}
