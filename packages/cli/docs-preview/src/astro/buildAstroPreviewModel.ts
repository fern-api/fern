import { replaceEnvVariables } from "@fern-api/core-utils";
import {
    APIV1Read,
    APIV1Write,
    ApiDefinition,
    convertAPIDefinitionToDb,
    convertDbAPIDefinitionToRead,
    DocsV1Write,
    FdrAPI,
    SDKSnippetHolder
} from "@fern-api/fdr-sdk";
import {
    type ApiManifest,
    buildLedgerReadModel,
    hashDeploymentInput,
    type InlineTranslationParams,
    type PublishParams,
    type TransformFileEntry,
    type TransformResult,
    transformPublishInput
} from "@fern-api/fdr-sdk/docs-ledger";
import type { DocsPublishInput, FileManifestEntry, LocaleEntry } from "@fern-api/fdr-sdk/orpc-client";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import {
    buildAllTranslationInputs,
    buildLedgerInput,
    measureImageSizes,
    sanitizeRelativePathForS3
} from "@fern-api/remote-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { createHash } from "crypto";
import { readFile } from "fs/promises";
import * as mime from "mime-types";
import { basename } from "path";
import { v4 as uuidv4 } from "uuid";
import type { PreviewDocsResult } from "../previewDocs.js";

const MEASURE_IMAGE_BATCH_SIZE = 50;
const DEFAULT_CONTENT_TYPE = "application/octet-stream";

export interface AstroPreviewBlob {
    bytes: Buffer;
    contentType: string;
}

export interface AstroPreviewFile {
    absoluteFilePath: AbsoluteFilePath;
    contentType: string;
    /** The ledger `fullPath` (sanitized fern-folder-relative path). */
    fullPath: string;
}

/**
 * Everything the local ledger mirror needs to serve one successful render:
 * the `fdr.json` pointer, every CAS blob (page markdown, config text blobs,
 * pruned API definitions, route shards), and the local files behind each
 * file-manifest entry.
 */
export interface AstroPreviewModel {
    orgId: string;
    domain: string;
    basepath: string;
    manifest: Buffer;
    blobs: ReadonlyMap<string, AstroPreviewBlob>;
    /** Keyed by `{hash}/{fullPath}`; identical bytes under several paths get one entry each. */
    files: ReadonlyMap<string, AstroPreviewFile>;
}

export async function buildAstroPreviewModel({
    previewResult,
    orgId,
    domain,
    basepath,
    substituteEnvVars,
    context
}: {
    previewResult: PreviewDocsResult;
    orgId: string;
    domain: string;
    basepath: string;
    substituteEnvVars: boolean;
    context: TaskContext;
}): Promise<AstroPreviewModel> {
    const { writeApiDefinitions, resolver, uploadedFiles } = previewResult.ledgerSource;
    const substitutedDefinition = substituteEnvVars
        ? substituteEnvVarsInDefinition(previewResult.ledgerSource.writeDocsDefinition, context)
        : previewResult.ledgerSource.writeDocsDefinition;

    const { fileManifest, fileIdToPath, files } = await buildFileManifest(uploadedFiles, context);
    const docsDefinition: DocsV1Write.DocsDefinition = {
        ...substitutedDefinition,
        config: remapFileIdsToPaths(substitutedDefinition.config, fileIdToPath)
    };

    const { localeEntry: baseLocale, blobs: rawBlobs } = buildLedgerInput({
        docsDefinition,
        apiDefinitions: writeApiDefinitions,
        fileManifest,
        fileIdToPath
    });
    const translations = await buildAllTranslationInputs({
        docsDefinition,
        apiDefinitions: writeApiDefinitions,
        fileManifest,
        fileIdToPath,
        resolver,
        context
    });
    for (const translation of translations) {
        for (const [hash, buf] of translation.blobs) {
            rawBlobs.set(hash, buf);
        }
    }

    const locales: LocaleEntry[] = [baseLocale, ...translations.map((t) => t.localeEntry)];
    const publishInput: DocsPublishInput = {
        orgId,
        domain,
        basepath,
        customDomains: [],
        previewId: null,
        defaultLocale: baseLocale.locale,
        locales
    };
    const deploymentHash = hashDeploymentInput(publishInput);

    const blobs = new Map<string, AstroPreviewBlob>();
    let baseResult: TransformResult | undefined;
    const inlineTranslations: InlineTranslationParams[] = [];
    const referencedFilesByPageId: Record<string, string[]> = {};
    for (const locale of locales) {
        const apiManifest = toLatestApiManifest(readApiManifest(locale, rawBlobs), context);
        const result = transformPublishInput({ ...locale, domain, fileDomain: domain }, apiManifest);
        Object.assign(referencedFilesByPageId, result.referencedFilesByPageId);

        for (const ref of result.contentRefs.values()) {
            const generated = result.generatedBlobs.get(ref.hash);
            const bytes = generated?.bytes ?? rawBlobs.get(ref.hash);
            if (bytes == null) {
                throw new Error(`Missing CAS blob ${ref.hash} for locale "${locale.locale}"`);
            }
            blobs.set(ref.hash, { bytes, contentType: ref.contentType });
        }

        if (baseResult == null) {
            baseResult = result;
        } else {
            inlineTranslations.push({
                locale: locale.locale,
                orgId,
                domain,
                segmentDetails: result.segmentDetails,
                artifacts: result.artifacts,
                segments: result.segments,
                nav: result.nav,
                deploymentSegments: result.deploymentSegments,
                files: tagFiles(result.fileEntries),
                configJson: remapFileIdsInValue(result.configJson, fileIdToPath)
            });
        }
    }
    if (baseResult == null) {
        throw new Error("Docs definition produced no locales");
    }

    const deploymentId = uuidv4();
    const siteId = uuidv4();
    const params: PublishParams = {
        segmentDetails: baseResult.segmentDetails,
        artifacts: baseResult.artifacts,
        segments: baseResult.segments,
        nav: baseResult.nav,
        deployment: {
            id: deploymentId,
            hash: deploymentHash,
            version: baseResult.version ?? undefined,
            repo: baseResult.repo ?? undefined,
            jsFilesHash: baseResult.jsFilesHash,
            configJson: baseResult.configJson,
            headerHash: baseResult.headerHash,
            footerHash: baseResult.footerHash,
            cssInlineHash: baseResult.cssInlineHash,
            jsInlineHash: baseResult.jsInlineHash,
            defaultLocale: baseLocale.locale,
            translations: locales.map((l) => l.locale)
        },
        deploymentSegments: baseResult.deploymentSegments,
        apiDefinitions: baseResult.apiDefinitions,
        site: { id: siteId, orgId, domain, basepath },
        files: tagFiles(baseResult.fileEntries),
        fileDomain: domain
    };

    const readModel = buildLedgerReadModel({
        params,
        baseResult,
        inlineTranslations,
        referencedFilesByPageId,
        deploymentId,
        siteId,
        deploymentHash,
        orgId,
        domain,
        fileDomain: domain,
        basepath,
        isPreview: false,
        isPrivate: false,
        assignedAt: new Date().toISOString(),
        assignedBy: null
    });
    for (const blob of readModel.blobs) {
        blobs.set(blob.hash, { bytes: blob.bytes, contentType: blob.contentType });
    }

    return {
        orgId,
        domain,
        basepath,
        manifest: Buffer.from(JSON.stringify(readModel.pointer), "utf-8"),
        blobs,
        files
    };
}

function substituteEnvVarsInDefinition(
    definition: DocsV1Write.DocsDefinition,
    context: TaskContext
): DocsV1Write.DocsDefinition {
    // jsFiles are excluded so JS/TS template literals are left untouched.
    const { jsFiles, ...rest } = definition;
    const substituted = replaceEnvVariables(
        rest,
        { onError: (e) => context.logger.error(e ?? "Unknown error during environment variable substitution") },
        { substituteAsEmpty: true }
    );
    return { ...substituted, jsFiles };
}

async function buildFileManifest(
    uploadedFiles: PreviewDocsResult["ledgerSource"]["uploadedFiles"],
    context: TaskContext
): Promise<{
    fileManifest: Record<string, FileManifestEntry>;
    fileIdToPath: Map<string, string>;
    files: Map<string, AstroPreviewFile>;
}> {
    const fileManifest: Record<string, FileManifestEntry> = {};
    const fileIdToPath = new Map<string, string>();
    const files = new Map<string, AstroPreviewFile>();

    const imagePaths = uploadedFiles
        .filter((file) => {
            const mediaType = mime.lookup(file.absoluteFilePath);
            return typeof mediaType === "string" && mediaType.startsWith("image/");
        })
        .map((file) => file.absoluteFilePath);
    const measuredImages = await measureImageSizes(imagePaths, MEASURE_IMAGE_BATCH_SIZE, context);

    for (const file of uploadedFiles) {
        const sanitizedPath = sanitizeRelativePathForS3(file.relativeFilePath);
        const buffer = await readFile(file.absoluteFilePath);
        const hash = createHash("sha256").update(new Uint8Array(buffer)).digest("hex");
        const contentType = mime.lookup(file.absoluteFilePath) || DEFAULT_CONTENT_TYPE;
        const image = measuredImages.get(file.absoluteFilePath);
        fileManifest[sanitizedPath] = {
            hash,
            contentType,
            contentLength: buffer.byteLength,
            filename: basename(sanitizedPath),
            ...(image != null ? { width: image.width, height: image.height } : {})
        };
        fileIdToPath.set(file.fileId, sanitizedPath);
        files.set(fileKey(hash, sanitizedPath), {
            absoluteFilePath: file.absoluteFilePath,
            contentType,
            fullPath: sanitizedPath
        });
    }

    return { fileManifest, fileIdToPath, files };
}

/**
 * The local preview mints a UUID fileId per uploaded file, but the ledger keys
 * files by `fullPath` (a real publish uses the path as the fileId). Page markdown
 * is remapped in `buildLedgerInput`; this does the same for the docs config —
 * navigation `icon`/`image` refs (`file:<fileId>` or a bare fileId) included —
 * so the renderer's path-keyed file lookups resolve them.
 */
export function remapFileIdsToPaths(
    config: DocsV1Write.DocsConfig,
    fileIdToPath: ReadonlyMap<string, string>
): DocsV1Write.DocsConfig {
    if (fileIdToPath.size === 0) {
        return config;
    }
    // The walk only swaps fileId strings for path strings inside plain JSON, so the shape is preserved.
    return remapFileIdsInValue(config, fileIdToPath) as DocsV1Write.DocsConfig;
}

export function remapFileIdsInValue(value: unknown, fileIdToPath: ReadonlyMap<string, string>): unknown {
    if (typeof value === "string") {
        if (value.startsWith("file:")) {
            const path = fileIdToPath.get(value.slice("file:".length));
            return path != null ? `file:${path}` : value;
        }
        return fileIdToPath.get(value) ?? value;
    }
    if (Array.isArray(value)) {
        return value.map((item) => remapFileIdsInValue(item, fileIdToPath));
    }
    if (isPlainObject(value)) {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [key, remapFileIdsInValue(item, fileIdToPath)])
        );
    }
    return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (value == null || typeof value !== "object") {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

export function fileKey(hash: string, fullPath: string): string {
    return `${hash}/${fullPath}`;
}

function tagFiles(entries: TransformFileEntry[]): PublishParams["files"] {
    return entries.map((entry) => ({
        fullPath: entry.fullPath,
        hash: entry.hash,
        contentType: entry.contentType,
        bucket: "public_docs"
    }));
}

/**
 * The write-format API manifest `buildLedgerInput` serialized for this locale,
 * read back from the blob pool so the transform sees exactly what a publish
 * would have uploaded (including per-locale translated API fallbacks).
 */
function readApiManifest(
    locale: LocaleEntry,
    blobs: ReadonlyMap<string, Buffer>
): Record<string, APIV1Write.ApiDefinition> {
    const hash = locale.apiManifest?.hash;
    if (hash == null) {
        return {};
    }
    const bytes = blobs.get(hash);
    if (bytes == null) {
        throw new Error(`Missing apiManifest blob ${hash} for locale "${locale.locale}"`);
    }
    return JSON.parse(bytes.toString("utf-8")) as Record<string, APIV1Write.ApiDefinition>;
}

/**
 * Mirrors FDR's manifest reader: V1 write → V1 read → latest, so the transform
 * receives the same shape it does on a real publish.
 */
function toLatestApiManifest(
    writeManifest: Record<string, APIV1Write.ApiDefinition>,
    context: TaskContext
): ApiManifest {
    const manifest: ApiManifest = {};
    for (const [apiDefinitionId, definition] of Object.entries(writeManifest)) {
        try {
            const read: APIV1Read.ApiDefinition = convertDbAPIDefinitionToRead(
                convertAPIDefinitionToDb(
                    definition,
                    FdrAPI.ApiDefinitionId(apiDefinitionId),
                    new SDKSnippetHolder({
                        snippetsConfigWithSdkId: {},
                        snippetsBySdkId: {},
                        snippetTemplatesByEndpoint: {},
                        snippetTemplatesByEndpointId: {},
                        snippetsBySdkIdAndEndpointId: {}
                    })
                )
            );
            manifest[apiDefinitionId] = ApiDefinition.ApiDefinitionV1ToLatest.from(read).migrate();
        } catch (error) {
            context.logger.warn(
                `[astro] Failed to convert API definition "${apiDefinitionId}": ${String(error)}. Skipping it.`
            );
        }
    }
    return manifest;
}
