import { docsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, dirname, doesPathExist } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import path from "path";
import YAML, { isMap, isScalar, isSeq, type Node, type YAMLMap } from "yaml";

import type { ResolvedMigrationSourceSpec } from "./projectMigrationSource.js";
import { writeOutputFile } from "./writeOutputFile.js";

export interface DocsMigrationRequest {
    docsPath: AbsoluteFilePath | undefined;
    workspaceName: string | undefined;
    isOnlyApiWorkspace: boolean;
    sourceSpecs: ResolvedMigrationSourceSpec[];
}

export interface DocsMigrationPlan {
    updatedSections: number;
    writes: Array<{ configurationPath: AbsoluteFilePath; contents: string }>;
}

/**
 * Reads, parses, and serializes every docs configuration the migration touches, writing none of them.
 *
 * Every refusal this migration can raise -- an unparseable referenced version or product file, a
 * spec type a direct `docs.yml` spec cannot express, a settings block that fails serialization --
 * must be raised from here, before the first byte is written.
 */
export async function prepareDocsMigration({
    docsPath,
    workspaceName,
    isOnlyApiWorkspace,
    sourceSpecs
}: DocsMigrationRequest): Promise<DocsMigrationPlan> {
    const plan: DocsMigrationPlan = { updatedSections: 0, writes: [] };
    if (docsPath == null || !(await doesPathExist(docsPath))) {
        return plan;
    }

    const rootDocument = await loadDocument(docsPath);
    if (usesLegacyOpenApiParser(rootDocument) && sourceSpecs.some((spec) => spec.hasLegacyOnlyDocsImportSettings)) {
        throw new CliError({
            message:
                "Docs migration cannot safely decouple this API while experimental.openapi-parser-v3 is false because the legacy docs parser consumes additional API import settings. Enable the default parser or migrate this API reference manually.",
            code: CliError.Code.ConfigError
        });
    }
    const configurationPaths = [
        docsPath,
        ...collectReferencedNavigationPaths(rootDocument, dirname(docsPath).toString())
    ];
    for (const [index, configurationPath] of configurationPaths.entries()) {
        const document = index === 0 ? rootDocument : await loadDocument(configurationPath);
        const updatedSections = migrateDocument({
            document,
            configurationPath,
            workspaceName,
            isOnlyApiWorkspace,
            sourceSpecs
        });
        if (updatedSections === 0) {
            continue;
        }
        const yaml = document.toString({ lineWidth: 0 });
        plan.updatedSections += updatedSections;
        plan.writes.push({ configurationPath, contents: yaml.endsWith("\n") ? yaml : `${yaml}\n` });
    }
    return plan;
}

export async function applyDocsMigration(plan: DocsMigrationPlan): Promise<void> {
    for (const { configurationPath, contents } of plan.writes) {
        await writeOutputFile(configurationPath, contents, true);
    }
}

export async function migrateDocsConfiguration(request: DocsMigrationRequest): Promise<number> {
    const plan = await prepareDocsMigration(request);
    await applyDocsMigration(plan);
    return plan.updatedSections;
}

async function loadDocument(configurationPath: AbsoluteFilePath): Promise<YAML.Document.Parsed> {
    const document = YAML.parseDocument(await readFile(configurationPath, "utf8"));
    if (document.errors.length > 0) {
        throw new CliError({
            message: `Could not update ${configurationPath}: ${document.errors.map((error) => error.message).join("; ")}`,
            code: CliError.Code.ParseError
        });
    }
    return document;
}

function migrateDocument({
    document,
    configurationPath,
    workspaceName,
    isOnlyApiWorkspace,
    sourceSpecs
}: {
    document: YAML.Document.Parsed;
    configurationPath: AbsoluteFilePath;
    workspaceName: string | undefined;
    isOnlyApiWorkspace: boolean;
    sourceSpecs: ResolvedMigrationSourceSpec[];
}): number {
    const docsDirectory = dirname(configurationPath).toString();
    let updatedSections = 0;
    visitNode(document.contents, (map) => {
        if (!isApiReferenceSection(map) || map.has("specs")) {
            return;
        }
        const referencedApiName = scalarString(map.get("api-name", true));
        const isAssociated =
            referencedApiName === workspaceName ||
            (referencedApiName == null && isOnlyApiWorkspace) ||
            (referencedApiName == null && workspaceName == null);
        if (!isAssociated) {
            return;
        }
        map.set(
            "specs",
            sourceSpecs.map((spec) => serializeDocsSpec(spec, docsDirectory))
        );
        updatedSections++;
    });
    return updatedSections;
}

function collectReferencedNavigationPaths(document: YAML.Document.Parsed, fernDirectory: string): AbsoluteFilePath[] {
    if (!isMap(document.contents)) {
        return [];
    }
    const paths = new Set<string>();
    collectVersionPaths(document.contents.get("versions", true), fernDirectory, paths);
    const products = document.contents.get("products", true);
    if (isSeq(products)) {
        for (const product of products.items) {
            if (!isMap(product)) {
                continue;
            }
            addReferencedPath(product.get("path", true), fernDirectory, paths);
            collectVersionPaths(product.get("versions", true), fernDirectory, paths);
        }
    }
    return [...paths].map(AbsoluteFilePath.of);
}

function collectVersionPaths(node: unknown, fernDirectory: string, paths: Set<string>): void {
    if (!isSeq(node)) {
        return;
    }
    for (const version of node.items) {
        if (!isMap(version) || scalarString(version.get("ref", true)) != null) {
            continue;
        }
        addReferencedPath(version.get("path", true), fernDirectory, paths);
    }
}

function addReferencedPath(node: unknown, fernDirectory: string, paths: Set<string>): void {
    const referencedPath = scalarString(node);
    if (referencedPath != null) {
        paths.add(path.resolve(fernDirectory, referencedPath));
    }
}

function serializeDocsSpec(
    spec: ResolvedMigrationSourceSpec,
    docsDirectory: string
): docsYml.RawSchemas.Serializer.ApiSpecConfiguration.Raw {
    if (spec.type !== "openapi" && spec.type !== "asyncapi" && spec.type !== "graphql") {
        throw new CliError({
            message: `Docs migration does not support direct ${spec.type} API specifications`,
            code: CliError.Code.ConfigError
        });
    }
    const configuration: docsYml.RawSchemas.ApiSpecConfiguration = {
        type: spec.type,
        path: relativePath(docsDirectory, spec.absolutePath),
        ...(spec.namespace == null ? {} : { namespace: spec.namespace }),
        ...(spec.absoluteOverlayPaths[0] == null
            ? {}
            : { overlays: relativePath(docsDirectory, spec.absoluteOverlayPaths[0]) }),
        ...(spec.absoluteOverridePaths.length === 0
            ? {}
            : { overrides: spec.absoluteOverridePaths.map((override) => relativePath(docsDirectory, override)) }),
        ...(spec.docsImportSettings == null
            ? {}
            : { settings: relativizeDocsImportSettings(spec.docsImportSettings, docsDirectory) })
    };
    return docsYml.RawSchemas.Serializer.ApiSpecConfiguration.jsonOrThrow(configuration);
}

function relativizeDocsImportSettings(
    settings: docsYml.RawSchemas.ApiSpecImportSettings,
    docsDirectory: string
): docsYml.RawSchemas.ApiSpecImportSettings {
    const errorResponses = settings.errorResponses;
    return {
        ...settings,
        ...(errorResponses == null
            ? {}
            : {
                  errorResponses: {
                      ...errorResponses,
                      schema:
                          typeof errorResponses.schema === "string"
                              ? relativePath(docsDirectory, errorResponses.schema)
                              : errorResponses.schema
                  }
              })
    };
}

function relativePath(from: string, to: string): string {
    const relative = path.relative(from, to).split(path.sep).join("/");
    return relative.startsWith(".") ? relative : `./${relative}`;
}

function isApiReferenceSection(map: YAMLMap): boolean {
    return typeof scalarString(map.get("api", true)) === "string";
}

function scalarString(node: unknown): string | undefined {
    return isScalar(node) && typeof node.value === "string" ? node.value : undefined;
}

function usesLegacyOpenApiParser(document: YAML.Document.Parsed): boolean {
    if (!isMap(document.contents)) {
        return false;
    }
    const experimental = document.contents.get("experimental", true);
    if (!isMap(experimental)) {
        return false;
    }
    const setting = experimental.get("openapi-parser-v3", true);
    return isScalar(setting) && setting.value === false;
}

function visitNode(node: Node | null | undefined, visitMap: (map: YAMLMap) => void): void {
    if (isMap(node)) {
        visitMap(node);
        for (const pair of node.items) {
            if (scalarString(pair.key) === "feature-flag") {
                continue;
            }
            visitNode(pair.value as Node | null, visitMap);
        }
        return;
    }
    if (isSeq(node)) {
        for (const item of node.items) {
            visitNode(item as Node | null, visitMap);
        }
    }
}
