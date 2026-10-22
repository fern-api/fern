import { createFdrService } from "@fern-api/core";
import { isPlainObject } from "@fern-api/core-utils";
import type { FdrClient } from "@fern-api/fdr-sdk";
import { type HttpMethod, HttpMethodSchema } from "@fern-api/fdr-sdk/orpc-client";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { isAutoVersion } from "@fern-api/generator-cli/autoversion";
import type { Logger } from "@fern-api/logger";
import { readFile } from "fs/promises";
import tmp from "tmp-promise";

import type { FernSdkGenApiPackageConfig } from "./fernSdkGenApi.js";
import { normalizeGoPackageForLookup } from "./normalizeRepoUrl.js";
import { downloadAndExtractZipToDirectory } from "./RemoteTaskHandler.js";

/** The upload is off unless this variable is `true`. */
export const UPLOAD_SDK_GEN_SNIPPETS_ENV_VAR = "FERN_UPLOAD_SDK_GEN_SNIPPETS";

/** Where sdk-gen writes the snippets inside every SDK it builds. */
export const SDK_SNIPPETS_JSON_PATH = "documentation/snippets/snippets.json";

type CreateSnippetsRequest = Parameters<FdrClient["snippetsFactory"]["createSnippetsForSdk"]>[0];

/** How FDR's snippet store files an SDK: the fields that name its package, without the version. */
type SdkIdentity = Record<string, string>;

interface SnippetStoreLanguage {
    /** Works out the package identity from the sdk-config; undefined when the sdk-config does not name one. */
    identify: (pkg: FernSdkGenApiPackageConfig | undefined) => SdkIdentity | undefined;
    /** The store keeps a sync and an async snippet for these; sdk-gen writes one, so it fills both. */
    syncAndAsync: boolean;
}

function nonEmpty(value: string | undefined): string | undefined {
    const trimmed = value?.trim();
    return trimmed == null || trimmed === "" ? undefined : trimmed;
}

/** For languages filed under the package name alone; `field` is how the store names it. */
function byPackageName(field: string): SnippetStoreLanguage["identify"] {
    return (pkg) => {
        const name = nonEmpty(pkg?.packageName);
        return name == null ? undefined : { [field]: name };
    };
}

/** The languages FDR's snippet store accepts today. A language not listed here is skipped. */
const SNIPPET_STORE_LANGUAGES: Record<string, SnippetStoreLanguage> = {
    typescript: { identify: byPackageName("package"), syncAndAsync: false },
    csharp: { identify: byPackageName("package"), syncAndAsync: false },
    ruby: { identify: byPackageName("gem"), syncAndAsync: false },
    python: { identify: byPackageName("package"), syncAndAsync: true },
    go: {
        syncAndAsync: false,
        identify: (pkg) => {
            const repository = nonEmpty(pkg?.modulePath) ?? nonEmpty(pkg?.packageName);
            return repository == null ? undefined : { githubRepo: normalizeGoPackageForLookup(repository) };
        }
    },
    java: {
        syncAndAsync: true,
        identify: (pkg) => {
            const group = nonEmpty(pkg?.groupId);
            const artifact = nonEmpty(pkg?.artifactId);
            return group == null || artifact == null ? undefined : { group, artifact };
        }
    }
};

export interface SdkGenEndpointSnippet {
    path: string;
    method: HttpMethod;
    code: string;
}

export type SdkGenSnippetsUploadDecision =
    | { upload: false; reason: string }
    | { upload: true; language: string; sdk: SdkIdentity; version: string };

export function isUploadSdkGenSnippetsEnabled(): boolean {
    return process.env[UPLOAD_SDK_GEN_SNIPPETS_ENV_VAR]?.trim().toLowerCase() === "true";
}

/**
 * Whether a finished sdk-gen target gets its snippets uploaded. Skips previews, languages the store does not
 * accept, and targets whose package or version cannot be worked out.
 */
export function decideSdkGenSnippetsUpload({
    isPreview,
    language,
    package: pkg,
    version
}: {
    isPreview: boolean;
    language: string | undefined;
    package: FernSdkGenApiPackageConfig | undefined;
    version: string | undefined;
}): SdkGenSnippetsUploadDecision {
    if (isPreview) {
        return { upload: false, reason: "preview generation" };
    }
    if (language == null) {
        return { upload: false, reason: "generator has no language" };
    }
    const storeLanguage = SNIPPET_STORE_LANGUAGES[language];
    if (storeLanguage == null) {
        return { upload: false, reason: `FDR's snippet store does not accept ${language} yet` };
    }
    const sdk = storeLanguage.identify(pkg);
    if (sdk == null) {
        return { upload: false, reason: `the sdk-config has no package name for ${language}` };
    }
    const resolvedVersion = nonEmpty(version);
    if (resolvedVersion == null || isAutoVersion(resolvedVersion)) {
        return { upload: false, reason: "no SDK version was resolved" };
    }
    return { upload: true, language, sdk, version: resolvedVersion };
}

/**
 * Parses `documentation/snippets/snippets.json`: endpoint path, then HTTP method, then code. The map sits under
 * `endpoints`, or under `snippets.endpoints` in the shape of core's /snippets response. Entries the store
 * cannot take (an unknown method or no code) are dropped.
 */
export function parseSdkSnippetsJson(text: string): SdkGenEndpointSnippet[] {
    const root: unknown = JSON.parse(text);
    const nested = isPlainObject(root) && isPlainObject(root.snippets) ? root.snippets.endpoints : undefined;
    const endpoints = isPlainObject(root) ? (root.endpoints ?? nested) : undefined;
    if (!isPlainObject(endpoints)) {
        return [];
    }
    return Object.entries(endpoints).flatMap(([path, byMethod]) =>
        Object.entries(isPlainObject(byMethod) ? byMethod : {}).flatMap(([rawMethod, code]) => {
            const method = HttpMethodSchema.safeParse(rawMethod.toUpperCase());
            return method.success && typeof code === "string" && code.trim() !== ""
                ? [{ path, method: method.data, code }]
                : [];
        })
    );
}

export function buildSnippetsCreateRequest({
    organization,
    apiId,
    language,
    sdk,
    version,
    endpoints
}: {
    organization: string;
    apiId: string;
    language: string;
    sdk: SdkIdentity;
    version: string;
    endpoints: SdkGenEndpointSnippet[];
}): CreateSnippetsRequest {
    const syncAndAsync = SNIPPET_STORE_LANGUAGES[language]?.syncAndAsync === true;
    const snippets = endpoints.map(({ path, method, code }) => ({
        endpoint: { path, method },
        snippet: syncAndAsync ? { sync_client: code, async_client: code } : { client: code }
    }));
    // The store's request is a union keyed by `type`; TypeScript cannot match a computed `type` to its `sdk` shape.
    return {
        orgId: organization,
        apiId,
        snippets: { type: language, sdk: { ...sdk, version }, snippets }
    } as CreateSnippetsRequest;
}

/**
 * Downloads the SDK artifact the same way a real download does, and reads the snippets file from it.
 * Undefined when the SDK has no snippets file.
 */
export async function readSnippetsJsonFromArtifact(artifactUrl: string): Promise<string | undefined> {
    const directory = await tmp.dir({ prefix: "fern-sdk-snippets", unsafeCleanup: true });
    try {
        const root = AbsoluteFilePath.of(directory.path);
        await downloadAndExtractZipToDirectory({ s3PreSignedReadUrl: artifactUrl, outputPath: root });
        const file = join(root, RelativeFilePath.of(SDK_SNIPPETS_JSON_PATH));
        return (await doesPathExist(file)) ? await readFile(file, "utf8") : undefined;
    } finally {
        await directory.cleanup();
    }
}

export interface UploadSdkGenSnippetsDependencies {
    createFdr?: (token: string) => Pick<FdrClient, "snippetsFactory">;
    readSnippetsJson?: (artifactUrl: string) => Promise<string | undefined>;
    isEnabled?: () => boolean;
}

/**
 * Uploads the snippets of a successful sdk-gen target to FDR's snippet store, so the next docs publish can
 * attach them to the endpoints. Does nothing, and prints nothing, unless the environment variable is set. Never
 * throws: a snippet problem must not fail the SDK generation.
 */
export async function uploadSdkGenSnippets(
    {
        token,
        organization,
        apiId,
        generatorName,
        language,
        package: pkg,
        version,
        artifactUrl,
        isPreview,
        logger
    }: {
        token: string;
        organization: string;
        apiId: string;
        generatorName: string;
        language: string | undefined;
        package: FernSdkGenApiPackageConfig | undefined;
        version: string | undefined;
        artifactUrl: string;
        isPreview: boolean;
        logger: Pick<Logger, "info" | "warn">;
    },
    dependencies: UploadSdkGenSnippetsDependencies = {}
): Promise<void> {
    const label = language ?? generatorName;
    const skip = (reason: string) => logger.info(`Skipped uploading ${label} snippets to FDR: ${reason}`);
    try {
        const isEnabled = dependencies.isEnabled ?? isUploadSdkGenSnippetsEnabled;
        if (!isEnabled()) {
            return;
        }
        const decision = decideSdkGenSnippetsUpload({ isPreview, language, package: pkg, version });
        if (!decision.upload) {
            return skip(decision.reason);
        }
        const snippetsJson = await (dependencies.readSnippetsJson ?? readSnippetsJsonFromArtifact)(artifactUrl);
        if (snippetsJson == null) {
            return skip(`the SDK has no ${SDK_SNIPPETS_JSON_PATH}`);
        }
        const endpoints = parseSdkSnippetsJson(snippetsJson);
        if (endpoints.length === 0) {
            return skip(`${SDK_SNIPPETS_JSON_PATH} has no endpoint snippets`);
        }
        const fdr = (dependencies.createFdr ?? ((value: string) => createFdrService({ token: value })))(token);
        await fdr.snippetsFactory.createSnippetsForSdk(
            buildSnippetsCreateRequest({ organization, apiId, ...decision, endpoints })
        );
        logger.info(`Uploaded ${endpoints.length} ${label} snippets to FDR (version ${decision.version})`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn(`Could not upload ${label} snippets to FDR (the SDK is not affected): ${message}`);
    }
}
