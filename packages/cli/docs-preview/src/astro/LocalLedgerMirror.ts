import express from "express";
import type { Server } from "http";
import type { AstroPreviewFile, AstroPreviewModel } from "./buildAstroPreviewModel.js";

const HASH_PATTERN = /^[0-9a-f]{64}$/;
const MANIFEST_FILENAME = "v1/fdr.json";

/**
 * Loopback HTTP server exposing an {@link AstroPreviewModel} in the layout the
 * Astro docs loader expects from `MIRROR_ENDPOINT` (`MIRROR_MODE=true`):
 *
 *   GET /manifest/{key}     the `fdr.json` pointer (local-mode keys)
 *   GET /cas/{key}          CAS blobs, bare hash or `v1/{orgId}/{ab}/{hash}`
 *   GET /dynamic-ir/{key}   always 404 (the loader fails open)
 *   GET /files/{domain}/{hash}/{fullPath}   local files from the manifest
 *
 * Only content present in the current model is ever served — there is no
 * filesystem fallback, so a request can never read outside the docs folder.
 * `replaceModel` swaps the served model atomically; callers keep the previous
 * model on failed reloads simply by not calling it.
 */
export class LocalLedgerMirror {
    private model: AstroPreviewModel | undefined;
    private server: Server | undefined;

    public replaceModel(model: AstroPreviewModel): void {
        this.model = model;
    }

    public getModel(): AstroPreviewModel | undefined {
        return this.model;
    }

    /** Binds to 127.0.0.1 and returns the bound port (useful when `port` is 0). */
    public async listen(port: number): Promise<number> {
        const app = express();
        app.disable("x-powered-by");

        app.use((req, res, next) => {
            if (req.method !== "GET" && req.method !== "HEAD") {
                res.set("Allow", "GET, HEAD").status(405).end();
                return;
            }
            if (this.model == null) {
                res.status(503).end();
                return;
            }
            next();
        });

        app.get(/^\/manifest\/(.*)$/, (req, res) => {
            const model = this.model;
            const key = decodeKey(req.params[0]);
            if (model == null || key == null || !isManifestKey(key, model.basepath)) {
                res.status(404).end();
                return;
            }
            res.type("application/json").send(model.manifest);
        });

        app.get(/^\/cas\/(.*)$/, (req, res) => {
            const model = this.model;
            const key = decodeKey(req.params[0]);
            const hash = key != null ? casHashFromKey(key, model?.orgId) : undefined;
            const blob = hash != null ? model?.blobs.get(hash) : undefined;
            if (blob == null) {
                res.status(404).end();
                return;
            }
            res.type(blob.contentType).send(blob.bytes);
        });

        app.get(/^\/dynamic-ir\/(.*)$/, (_req, res) => {
            res.status(404).end();
        });

        app.get("/files/.missing.json", (_req, res) => {
            res.json([]);
        });

        app.get(/^\/files\/(.*)$/, (req, res) => {
            const model = this.model;
            const key = decodeKey(req.params[0]);
            const file = key != null && model != null ? fileFromKey(key, model) : undefined;
            if (file == null) {
                res.status(404).end();
                return;
            }
            res.sendFile(file.absoluteFilePath, { headers: { "Content-Type": file.contentType } }, (error) => {
                if (error != null && !res.headersSent) {
                    res.status(404).end();
                }
            });
        });

        app.use((_req, res) => {
            res.status(404).end();
        });

        return await new Promise<number>((resolve, reject) => {
            const server = app.listen(port, "127.0.0.1");
            server.once("listening", () => {
                this.server = server;
                const address = server.address();
                resolve(typeof address === "object" && address != null ? address.port : port);
            });
            server.once("error", reject);
        });
    }

    public async close(): Promise<void> {
        const server = this.server;
        this.server = undefined;
        if (server == null) {
            return;
        }
        await new Promise<void>((resolve) => server.close(() => resolve()));
    }
}

function decodeKey(raw: string | undefined): string | undefined {
    if (raw == null || raw.length === 0) {
        return undefined;
    }
    let key: string;
    try {
        key = decodeURIComponent(raw);
    } catch {
        return undefined;
    }
    if (key.includes("\0") || key.includes("\\") || key.split("/").some((seg) => seg === "" || seg === "..")) {
        return undefined;
    }
    return key;
}

function isManifestKey(key: string, basepath: string): boolean {
    if (key === MANIFEST_FILENAME) {
        return true;
    }
    const trimmed = basepath.replace(/^\/+|\/+$/g, "");
    return trimmed.length > 0 && key === `${trimmed}/${MANIFEST_FILENAME}`;
}

/** Accepts both CAS layouts the loader probes: bare `{hash}` and `v1/{orgId}/{ab}/{hash}`. */
function casHashFromKey(key: string, orgId: string | undefined): string | undefined {
    if (HASH_PATTERN.test(key)) {
        return key;
    }
    const segments = key.split("/");
    if (segments.length !== 4) {
        return undefined;
    }
    const [version, org, prefix, hash] = segments;
    if (version !== "v1" || org !== orgId || hash == null || !HASH_PATTERN.test(hash) || prefix !== hash.slice(0, 2)) {
        return undefined;
    }
    return hash;
}

/** Files are keyed `{domain}/{hash}/{fullPath}` (the files-CDN pathname). */
function fileFromKey(key: string, model: AstroPreviewModel): AstroPreviewFile | undefined {
    const segments = key.split("/");
    if (segments.length < 3) {
        return undefined;
    }
    const [domain, hash, ...rest] = segments;
    if (domain !== model.domain || hash == null || !HASH_PATTERN.test(hash)) {
        return undefined;
    }
    const file = model.files.get(hash);
    if (file == null || rest.join("/") !== file.fullPath) {
        return undefined;
    }
    return file;
}
