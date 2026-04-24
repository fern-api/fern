import { AbsoluteFilePath, doesPathExist, resolve } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { mkdtemp, readFile, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { FETCH_API_SPEC_REQUEST_TIMEOUT_MS } from "../../constants.js";
import type { Context } from "../../context/Context.js";
import type { ApiSpec, ApiSpecType } from "../config/ApiSpec.js";
import { ApiSpecDetector } from "./ApiSpecDetector.js";

export namespace ApiSpecResolver {
    export interface Args {
        reference: string;
    }

    export interface Result {
        /* The absolute file path to the file (i.e. downloaded from a URL or local file). */
        absoluteFilePath: AbsoluteFilePath;
        /* The original user-provided reference (path or URL), used in error messages. */
        reference: string;
        /* The API specification. */
        spec: ApiSpec;
    }
}

export class ApiSpecResolver {
    private readonly context: Context;
    private readonly detector: ApiSpecDetector;

    constructor({ context }: { context: Context }) {
        this.context = context;
        this.detector = new ApiSpecDetector();
    }

    /**
     * Resolves a string reference (local path or URL) to a fully-constructed ApiSpec.
     */
    public async resolve(args: ApiSpecResolver.Args): Promise<ApiSpecResolver.Result> {
        if (this.isUrl(args.reference)) {
            return this.resolveUrl(args);
        }
        return this.resolveLocal(args);
    }

    private async resolveUrl({ reference }: { reference: string }): Promise<ApiSpecResolver.Result> {
        const { content, contentType } = await this.fetchContent({ url: reference });
        const extension = this.inferExtension({ url: reference, contentType });
        const tempDir = await mkdtemp(path.join(tmpdir(), "fern-"));
        const absoluteFilePath = AbsoluteFilePath.of(path.join(tempDir, `spec${extension}`));
        await writeFile(absoluteFilePath, content, "utf-8");

        const specType = await this.detector.detect({ absoluteFilePath, content, reference });
        return {
            absoluteFilePath,
            reference,
            spec: this.buildApiSpec({ absoluteFilePath, specType, origin: reference })
        };
    }

    private async resolveLocal({ reference }: { reference: string }): Promise<ApiSpecResolver.Result> {
        const absoluteFilePath = resolve(this.context.cwd, reference);
        if (!(await doesPathExist(absoluteFilePath))) {
            throw new CliError({
                message: `API spec file does not exist: ${reference}`,
                code: CliError.Code.ConfigError
            });
        }

        const content = await readFile(absoluteFilePath, "utf-8");
        const specType = await this.detector.detect({ absoluteFilePath, content, reference });
        return {
            absoluteFilePath,
            reference,
            spec: this.buildApiSpec({ absoluteFilePath, specType })
        };
    }

    private async fetchContent({ url }: { url: string }): Promise<{ content: string; contentType: string }> {
        const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_API_SPEC_REQUEST_TIMEOUT_MS) });
        if (!response.ok) {
            throw new CliError({
                message: `Failed to fetch "${url}": HTTP ${response.status} ${response.statusText}`,
                code: CliError.Code.NetworkError
            });
        }
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("text/html")) {
            throw new CliError({
                message:
                    `The URL "${url}" returned HTML content. ` +
                    `Ensure you're pointing to a raw spec URL, not a documentation page.`,
                code: CliError.Code.ConfigError
            });
        }
        const content = await response.text();
        return { content, contentType };
    }

    private inferExtension({ url, contentType }: { url: string; contentType: string }): string {
        const urlPath = new URL(url).pathname.toLowerCase();
        if (urlPath.endsWith(".graphql") || urlPath.endsWith(".graphqls") || urlPath.endsWith(".gql")) {
            return ".graphql";
        }
        if (urlPath.endsWith(".json")) {
            return ".json";
        }
        if (urlPath.endsWith(".yaml") || urlPath.endsWith(".yml")) {
            return ".yaml";
        }
        if (contentType.includes("json")) {
            return ".json";
        }
        return ".yaml";
    }

    private buildApiSpec({
        absoluteFilePath,
        specType,
        origin
    }: {
        absoluteFilePath: AbsoluteFilePath;
        specType: ApiSpecType;
        origin?: string;
    }): ApiSpec {
        switch (specType) {
            case "openapi":
                return { openapi: absoluteFilePath, origin };
            case "asyncapi":
                return { asyncapi: absoluteFilePath, origin };
            case "graphql":
                return { graphql: absoluteFilePath, origin };
            default:
                throw new CliError({
                    message: `Unsupported spec type for flags mode: "${specType}". Supported: openapi, asyncapi, graphql`,
                    code: CliError.Code.ConfigError
                });
        }
    }

    private isUrl(reference: string): boolean {
        return reference.startsWith("https://") || reference.startsWith("http://");
    }
}
