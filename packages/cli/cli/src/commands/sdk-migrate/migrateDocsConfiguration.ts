import type { docsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, dirname, doesPathExist } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import path from "path";
import YAML, { isMap, isScalar, isSeq, type Node, type YAMLMap } from "yaml";

import type { ResolvedMigrationSourceSpec } from "./projectMigrationSource.js";
import { writeOutputFile } from "./writeOutputFile.js";

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
}): Promise<number> {
    if (docsPath == null || !(await doesPathExist(docsPath))) {
        return 0;
    }

    const rootDocument = await loadDocument(docsPath);
    const configurationPaths = [
        docsPath,
        ...collectReferencedNavigationPaths(rootDocument, dirname(docsPath).toString())
    ];
    let updatedSections = 0;
    for (const [index, configurationPath] of configurationPaths.entries()) {
        const document = index === 0 ? rootDocument : await loadDocument(configurationPath);
        updatedSections += await migrateDocument({
            document,
            configurationPath,
            workspaceName,
            isOnlyApiWorkspace,
            sourceSpecs
        });
    }
    return updatedSections;
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

async function migrateDocument({
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
}): Promise<number> {
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

    if (updatedSections === 0) {
        return 0;
    }
    const yaml = document.toString({ lineWidth: 0 });
    await writeOutputFile(configurationPath, yaml.endsWith("\n") ? yaml : `${yaml}\n`, true);
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
): docsYml.RawSchemas.ApiSpecConfiguration {
    if (spec.type !== "openapi" && spec.type !== "asyncapi" && spec.type !== "graphql") {
        throw new CliError({
            message: `Docs migration does not support direct ${spec.type} API specifications`,
            code: CliError.Code.ConfigError
        });
    }
    if (spec.hasCustomApiSettings === true || spec.apiImportSettings != null) {
        throw new CliError({
            message: `Docs migration cannot preserve custom API import settings for '${spec.absolutePath}' because direct docs.yml specifications do not support them yet. Migrate this API reference manually or remove the custom settings before retrying.`,
            code: CliError.Code.ConfigError
        });
    }
    return {
        type: spec.type,
        path: relativePath(docsDirectory, spec.absolutePath),
        ...(spec.namespace == null ? {} : { namespace: spec.namespace }),
        ...(spec.absoluteOverlayPaths[0] == null
            ? {}
            : { overlays: relativePath(docsDirectory, spec.absoluteOverlayPaths[0]) }),
        ...(spec.absoluteOverridePaths.length === 0
            ? {}
            : { overrides: spec.absoluteOverridePaths.map((override) => relativePath(docsDirectory, override)) })
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
