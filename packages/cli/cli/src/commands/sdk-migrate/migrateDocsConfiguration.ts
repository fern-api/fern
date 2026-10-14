import { docsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, dirname, doesPathExist } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import path from "path";
import YAML, { isMap, isScalar, isSeq, type Node, type YAMLMap } from "yaml";

import type { ResolvedMigrationSourceSpec } from "./projectMigrationSource.js";

export interface DocsConfigurationEdit {
    contents: string;
    path: AbsoluteFilePath;
}

export interface DocsConfigurationMigration {
    /** Rewritten docs configuration files. Nothing is written here so the caller can commit them atomically. */
    edits: DocsConfigurationEdit[];
    updatedSections: number;
}

export async function migrateDocsConfiguration({
    docsPath,
    workspaceName,
    isOnlyApiWorkspace,
    sourceSpecs
}: {
    docsPath: AbsoluteFilePath | undefined;
    workspaceName: string | undefined;
    isOnlyApiWorkspace: boolean;
    sourceSpecs: ResolvedMigrationSourceSpec[];
}): Promise<DocsConfigurationMigration> {
    if (docsPath == null || !(await doesPathExist(docsPath))) {
        return { edits: [], updatedSections: 0 };
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
    const edits: DocsConfigurationEdit[] = [];
    let updatedSections = 0;
    for (const [index, configurationPath] of configurationPaths.entries()) {
        const document = index === 0 ? rootDocument : await loadDocument(configurationPath);
        const migrated = migrateDocument({
            document,
            configurationPath,
            workspaceName,
            isOnlyApiWorkspace,
            sourceSpecs
        });
        updatedSections += migrated.updatedSections;
        if (migrated.edit != null) {
            edits.push(migrated.edit);
        }
    }
    return { edits, updatedSections };
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
}): { edit?: DocsConfigurationEdit; updatedSections: number } {
    const docsDirectory = dirname(configurationPath).toString();
    let updatedSections = 0;
    visitNode(document.contents, (map) => {
        if (!isApiReferenceSection(map) || map.has("specs")) {
            return undefined;
        }
        const referencedApiName = scalarString(map.get("api-name", true));
        const isAssociated =
            referencedApiName === workspaceName ||
            (referencedApiName == null && isOnlyApiWorkspace) ||
            (referencedApiName == null && workspaceName == null);
        if (!isAssociated) {
            return undefined;
        }
        const sections = splitApiReferenceSection(map, sourceSpecs, docsDirectory);
        updatedSections += sections.length;
        return sections;
    });

    if (updatedSections === 0) {
        return { updatedSections };
    }
    const yaml = document.toString({ lineWidth: 0 });
    return { edit: { contents: yaml.endsWith("\n") ? yaml : `${yaml}\n`, path: configurationPath }, updatedSections };
}

/**
 * One API reference section per source spec, so each spec is its own navigation item. A single spec keeps the
 * original section as is. With several, each copy gets a distinct title (and slug, when one is set) built from the
 * spec's namespace, or its file name when it has none.
 */
function splitApiReferenceSection(
    section: YAMLMap,
    sourceSpecs: ResolvedMigrationSourceSpec[],
    docsDirectory: string
): YAMLMap[] {
    const [onlySpec] = sourceSpecs;
    if (onlySpec != null && sourceSpecs.length === 1) {
        section.set("specs", [serializeDocsSpec(onlySpec, docsDirectory)]);
        return [section];
    }
    const title = scalarString(section.get("api", true));
    const slug = scalarString(section.get("slug", true));
    const usedLabels = new Set<string>();
    return sourceSpecs.map((spec) => {
        const baseLabel = spec.namespace ?? path.basename(spec.absolutePath, path.extname(spec.absolutePath));
        let label = baseLabel;
        for (let suffix = 2; usedLabels.has(label); suffix++) {
            label = `${baseLabel}-${suffix}`;
        }
        usedLabels.add(label);
        const copy = section.clone() as YAMLMap;
        copy.set("api", `${title} - ${label}`);
        if (slug != null) {
            copy.set("slug", `${slug}-${label}`);
        }
        copy.set("specs", [serializeDocsSpec(spec, docsDirectory)]);
        return copy;
    });
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

/**
 * Walks the navigation tree. `expandSection` may return replacement sections for a map that sits in a list, in which
 * case the map is swapped out and its replacements are not walked again.
 */
function visitNode(node: Node | null | undefined, expandSection: (map: YAMLMap) => YAMLMap[] | undefined): void {
    if (isMap(node)) {
        for (const pair of node.items) {
            if (scalarString(pair.key) === "feature-flag") {
                continue;
            }
            visitNode(pair.value as Node | null, expandSection);
        }
        return;
    }
    if (isSeq(node)) {
        node.items = node.items.flatMap((item) => {
            const replacement = isMap(item) ? expandSection(item) : undefined;
            if (replacement != null) {
                return replacement;
            }
            visitNode(item as Node | null, expandSection);
            return [item];
        });
    }
}
