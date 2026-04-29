import { isURL } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { execSync } from "child_process";
import { createHash } from "crypto";
import { access, readFile } from "fs/promises";
import mime from "mime-types";
import path from "path";
import { describeFetchError, FDR_ORIGIN, parseErrorDetail } from "./themeOrigin.js";

function getGitRoot(): string {
    try {
        return execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim();
    } catch {
        return process.cwd();
    }
}

function posixBindPath(gitRoot: string, absolutePath: string): string {
    const repoName = path.basename(gitRoot);
    const relative = path.relative(gitRoot, absolutePath);
    return [repoName, ...relative.split(path.sep)].join("/");
}

export interface ProcessedThemeConfig {
    config: Record<string, unknown>;
    filesUploaded: number;
}

export class ThemeConfigProcessor {
    private readonly themeDir: string;
    private readonly orgId: string;
    private readonly token: string;
    private readonly gitRoot: string;
    private readonly context: TaskContext;

    public constructor({
        docsWorkspace,
        orgId,
        token,
        context
    }: {
        docsWorkspace: DocsWorkspace;
        orgId: string;
        token: string;
        context: TaskContext;
    }) {
        this.themeDir = path.join(docsWorkspace.absoluteFilePath, "theme");
        this.orgId = orgId;
        this.token = token;
        this.gitRoot = getGitRoot();
        this.context = context;
    }

    public async process(raw: Record<string, unknown>): Promise<ProcessedThemeConfig> {
        await this.validateAllFiles(raw);
        return this.uploadAllFiles(raw);
    }

    private async validateAllFiles(raw: Record<string, unknown>): Promise<void> {
        const filePaths = this.collectFilePaths(raw);
        const errors: string[] = [];
        await Promise.all(
            filePaths.map(async (filePath) => {
                const abs = path.resolve(this.themeDir, filePath);
                try {
                    await access(abs);
                } catch {
                    errors.push(`Referenced file not found: ${abs}`);
                }
            })
        );
        if (errors.length > 0) {
            throw new CliError({
                message: `Theme validation failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
                code: CliError.Code.ConfigError
            });
        }
    }

    public collectFilePaths(raw: Record<string, unknown>): string[] {
        const paths: string[] = [];

        const collect = (value: string | undefined): void => {
            if (value != null && !isURL(value)) {
                paths.push(value);
            }
        };

        if (raw.logo != null && typeof raw.logo === "object") {
            const logo = raw.logo as Record<string, unknown>;
            collect(logo.dark as string | undefined);
            collect(logo.light as string | undefined);
        }

        collect(raw.favicon as string | undefined);

        if (raw["background-image"] != null && typeof raw["background-image"] === "object") {
            const bg = raw["background-image"] as Record<string, unknown>;
            collect(bg.dark as string | undefined);
            collect(bg.light as string | undefined);
        }

        if (raw.typography != null && typeof raw.typography === "object") {
            const typo = raw.typography as Record<string, unknown>;
            for (const fontKey of ["bodyFont", "headingsFont", "codeFont"]) {
                const font = typo[fontKey];
                if (font != null && typeof font === "object") {
                    const fontObj = font as Record<string, unknown>;
                    if (Array.isArray(fontObj.paths)) {
                        for (const entry of fontObj.paths as Array<Record<string, unknown>>) {
                            collect(entry.path as string | undefined);
                        }
                    }
                }
            }
        }

        const cssList = raw.css != null ? (Array.isArray(raw.css) ? raw.css : [raw.css]) : [];
        for (const item of cssList) {
            if (typeof item === "string") {
                collect(item);
            }
        }

        const jsList = raw.js != null ? (Array.isArray(raw.js) ? raw.js : [raw.js]) : [];
        for (const entry of jsList) {
            if (typeof entry === "string") {
                collect(entry);
            } else if (entry != null && typeof entry === "object") {
                const e = entry as Record<string, unknown>;
                if (typeof e.path === "string") {
                    collect(e.path);
                }
            }
        }

        collect(raw.header as string | undefined);
        collect(raw.footer as string | undefined);

        if (raw.metadata != null && typeof raw.metadata === "object") {
            const meta = raw.metadata as Record<string, unknown>;
            for (const imgKey of ["og:image", "twitter:image", "og:background-image", "og:logo"]) {
                if (typeof meta[imgKey] === "string") {
                    collect(meta[imgKey] as string);
                }
            }
        }

        return paths;
    }

    private async uploadAllFiles(raw: Record<string, unknown>): Promise<ProcessedThemeConfig> {
        const cfg: Record<string, unknown> = { ...raw };
        let filesUploaded = 0;

        const field = async (value: string | undefined): Promise<string | { hash: string } | undefined> => {
            if (value == null) {
                return undefined;
            }
            if (isURL(value)) {
                return value;
            }
            const abs = path.resolve(this.themeDir, value);
            this.context.logger.debug(`  Uploading ${value}...`);
            const hash = await this.uploadFileToCas(abs);
            filesUploaded++;
            return { hash };
        };

        if (cfg.logo != null && typeof cfg.logo === "object") {
            const logo = { ...(cfg.logo as Record<string, unknown>) };
            logo.dark = await field(logo.dark as string | undefined);
            logo.light = await field(logo.light as string | undefined);
            cfg.logo = logo;
        }

        cfg.favicon = await field(cfg.favicon as string | undefined);

        if (cfg["background-image"] != null && typeof cfg["background-image"] === "object") {
            const bg = { ...(cfg["background-image"] as Record<string, unknown>) };
            bg.dark = await field(bg.dark as string | undefined);
            bg.light = await field(bg.light as string | undefined);
            cfg["background-image"] = bg;
        }

        if (cfg.typography != null && typeof cfg.typography === "object") {
            const typo = { ...(cfg.typography as Record<string, unknown>) };
            for (const fontKey of ["bodyFont", "headingsFont", "codeFont"]) {
                const font = typo[fontKey];
                if (font != null && typeof font === "object") {
                    const fontObj = { ...(font as Record<string, unknown>) };
                    if (Array.isArray(fontObj.paths)) {
                        fontObj.paths = await Promise.all(
                            (fontObj.paths as Array<Record<string, unknown>>).map(async (entry) => {
                                const p = entry.path as string | undefined;
                                if (p == null) {
                                    return entry;
                                }
                                return { ...entry, path: await field(p) };
                            })
                        );
                    }
                    typo[fontKey] = fontObj;
                }
            }
            cfg.typography = typo;
        }

        if (cfg.css != null) {
            const cssList: unknown[] = Array.isArray(cfg.css) ? cfg.css : [cfg.css];
            cfg.css = await Promise.all(cssList.map((item) => (typeof item === "string" ? field(item) : item)));
        }

        if (cfg.js != null) {
            const jsList: unknown[] = Array.isArray(cfg.js) ? cfg.js : [cfg.js];
            cfg.js = await Promise.all(
                jsList.map(async (entry) => {
                    if (typeof entry === "string") {
                        return field(entry);
                    }
                    if (entry != null && typeof entry === "object") {
                        const e = { ...(entry as Record<string, unknown>) };
                        if (typeof e.url === "string") {
                            return e;
                        }
                        if (typeof e.path === "string") {
                            e.path = await field(e.path);
                        }
                        return e;
                    }
                    return entry;
                })
            );
        }

        cfg.header = await field(cfg.header as string | undefined);
        cfg.footer = await field(cfg.footer as string | undefined);

        if (cfg.metadata != null && typeof cfg.metadata === "object") {
            const meta = { ...(cfg.metadata as Record<string, unknown>) };
            for (const imgKey of ["og:image", "twitter:image", "og:background-image", "og:logo"]) {
                if (typeof meta[imgKey] === "string") {
                    meta[imgKey] = await field(meta[imgKey] as string);
                }
            }
            cfg.metadata = meta;
        }

        return { config: cfg, filesUploaded };
    }

    private async uploadFileToCas(absolutePath: string): Promise<string> {
        const content = await readFile(absolutePath);
        const contentType = (mime.lookup(absolutePath) || "application/octet-stream") as string;
        const bindPath = posixBindPath(this.gitRoot, absolutePath);
        return this.uploadToCas(content, contentType, bindPath, path.basename(absolutePath));
    }

    private async uploadToCas(content: Buffer, contentType: string, bindPath: string, label: string): Promise<string> {
        const hash = createHash("sha256").update(content).digest("hex");

        const casUrl = `${FDR_ORIGIN}/v2/registry/content/${hash}?orgId=${encodeURIComponent(this.orgId)}`;
        this.context.logger.debug(`  CAS check: PUT ${casUrl} (${contentType}, ${content.byteLength} bytes)`);

        let checkRes: Response;
        try {
            checkRes = await fetch(casUrl, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.token}` },
                body: JSON.stringify({ contentType, contentLength: content.byteLength })
            });
        } catch (err) {
            throw new CliError({
                message: `CAS check for ${label} failed — could not reach ${FDR_ORIGIN}: ${describeFetchError(err)}`,
                code: CliError.Code.NetworkError
            });
        }

        if (!checkRes.ok) {
            const errorBody = await checkRes.text();
            const detail = parseErrorDetail(errorBody) ?? errorBody;
            throw new CliError({
                message: `CAS check failed for ${label}: HTTP ${checkRes.status} — ${detail}`,
                code: CliError.Code.NetworkError
            });
        }

        const checkBody = (await checkRes.json()) as { status: string; uploadUrl?: string };
        this.context.logger.debug(`  CAS status for ${label}: ${checkBody.status}`);

        if (checkBody.status === "upload_required" && checkBody.uploadUrl != null) {
            this.context.logger.debug(`  Uploading ${label} to S3 (${content.byteLength} bytes)...`);
            let uploadRes: Response;
            try {
                uploadRes = await fetch(checkBody.uploadUrl, {
                    method: "PUT",
                    headers: { "Content-Type": contentType },
                    body: new Uint8Array(content.buffer as ArrayBuffer, content.byteOffset, content.byteLength)
                });
            } catch (err) {
                throw new CliError({
                    message: `S3 upload for ${label} failed — could not reach upload URL: ${describeFetchError(err)}`,
                    code: CliError.Code.NetworkError
                });
            }
            if (!uploadRes.ok) {
                const errorBody = await uploadRes.text().catch(() => "");
                throw new CliError({
                    message: `S3 upload failed for ${label}: HTTP ${uploadRes.status}${errorBody ? ` — ${errorBody}` : ""}`,
                    code: CliError.Code.NetworkError
                });
            }
        }

        const encodedPath = bindPath.split("/").map(encodeURIComponent).join("/");
        const bindUrl = `${FDR_ORIGIN}/v2/registry/files/${encodeURIComponent(this.orgId)}/${encodedPath}`;
        this.context.logger.debug(`  Binding ${label} → ${bindPath}`);

        let bindRes: Response;
        try {
            bindRes = await fetch(bindUrl, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.token}` },
                body: JSON.stringify({ hash, contentType })
            });
        } catch (err) {
            throw new CliError({
                message: `File bind for ${label} failed — could not reach ${FDR_ORIGIN}: ${describeFetchError(err)}`,
                code: CliError.Code.NetworkError
            });
        }

        if (!bindRes.ok) {
            const errorBody = await bindRes.text().catch(() => "");
            throw new CliError({
                message: `File bind failed for ${label}: HTTP ${bindRes.status}${errorBody ? ` — ${errorBody}` : ""}`,
                code: CliError.Code.NetworkError
            });
        }

        return hash;
    }
}
