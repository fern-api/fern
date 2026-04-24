import { CliError } from "@fern-api/task-context";

import { copyFile, mkdir, readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { command } from "../../../_internal/command.js";

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

export declare namespace ExportThemeCommand {
    export interface Args extends GlobalArgs {
        directory?: string;
    }
}

export class ExportThemeCommand {
    public async handle(context: Context, args: ExportThemeCommand.Args): Promise<void> {
        const docsYmlPath = path.resolve(process.cwd(), "fern", "docs.yml");
        try {
            await readFile(docsYmlPath);
        } catch {
            throw new CliError({
                message: `No docs.yml found at ${docsYmlPath}`,
                code: CliError.Code.ConfigError
            });
        }
        const docsDir = path.dirname(docsYmlPath);
        const outDir = args.directory
            ? path.resolve(process.cwd(), args.directory)
            : path.resolve(process.cwd(), "fern", "theme");

        context.stdout.info(`Exporting theme-eligible fields from docs.yml → ${outDir}`);

        const raw = yaml.load(await readFile(docsYmlPath as string, "utf-8")) as Record<string, unknown>;
        const themeConfig: Record<string, unknown> = {};

        for (const [k, v] of Object.entries(raw)) {
            if (THEME_ELIGIBLE_KEYS.has(k)) {
                themeConfig[k] = v;
            }
        }

        await mkdir(outDir, { recursive: true });
        const assetsDir = path.join(outDir, "assets");
        await mkdir(assetsDir, { recursive: true });

        const exported = await this.copyLocalFiles(themeConfig, docsDir, assetsDir, context);

        await writeFile(path.join(outDir, "theme.yml"), yaml.dump(exported), "utf-8");

        context.stdout.info(`✓ Theme exported to ${outDir}/theme.yml`);
    }

    private async copyLocalFiles(
        obj: unknown,
        sourceDir: string,
        assetsDir: string,
        context: Context
    ): Promise<unknown> {
        if (obj === null || typeof obj !== "object") {
            if (typeof obj === "string" && !obj.startsWith("http://") && !obj.startsWith("https://")) {
                const abs = path.resolve(sourceDir, obj);
                const dest = path.join(assetsDir, path.basename(abs));
                try {
                    await copyFile(abs, dest);
                    context.stdout.debug(`  Copied ${obj} → assets/${path.basename(abs)}`);
                    return `./assets/${path.basename(abs)}`;
                } catch {
                    return obj;
                }
            }
            return obj;
        }

        if (Array.isArray(obj)) {
            return Promise.all(obj.map((el) => this.copyLocalFiles(el, sourceDir, assetsDir, context)));
        }

        const result: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
            result[k] = await this.copyLocalFiles(v, sourceDir, assetsDir, context);
        }
        return result;
    }
}

export function addExportThemeCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new ExportThemeCommand();
    command(
        cli,
        "export",
        "Export theme-eligible fields from docs.yml into a standalone theme directory",
        (context, args) => cmd.handle(context, args as ExportThemeCommand.Args),
        (yargs) =>
            yargs
                .option("directory", {
                    alias: "d",
                    type: "string",
                    description: "Directory to export the theme into (default: ./fern/theme)"
                })
                .example("$0 docs theme export", "Export theme from docs.yml to ./fern/theme")
                .example("$0 docs theme export --directory ./my-theme", "Export to a custom directory")
    );
}
