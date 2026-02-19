import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { AsyncAPIV2, AsyncAPIV3 } from "@fern-api/openapi-ir-parser";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

import { mergeWithOverrides } from "../loaders/mergeWithOverrides.js";

export async function loadAsyncAPI({
    context,
    absoluteFilePath,
    absoluteFilePathToOverrides
}: {
    context: TaskContext;
    absoluteFilePath: AbsoluteFilePath;
    absoluteFilePathToOverrides: AbsoluteFilePath | undefined;
}): Promise<AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3> {
    const contents = (await readFile(absoluteFilePath)).toString();
    const parsed = (await yaml.load(contents)) as AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3;
    await bundleExternalSchemaRefs(parsed as unknown as Record<string, unknown>, path.dirname(absoluteFilePath));
    if (absoluteFilePathToOverrides != null) {
        return await mergeWithOverrides<AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3>({
            absoluteFilePathToOverrides,
            context,
            data: parsed
        });
    }
    return parsed;
}

async function bundleExternalSchemaRefs(document: Record<string, unknown>, basePath: string): Promise<void> {
    const fileCache = new Map<string, Record<string, unknown>>();
    const refToSchemaName = new Map<string, string>();
    const visited = new Set<string>();

    const components = ensureObject(document, "components");
    const schemas = ensureObject(components, "schemas");

    await rewriteExternalRefs(document, basePath, fileCache, schemas, refToSchemaName, visited);
}

function ensureObject(parent: Record<string, unknown>, key: string): Record<string, unknown> {
    if (parent[key] == null || typeof parent[key] !== "object") {
        parent[key] = {};
    }
    return parent[key] as Record<string, unknown>;
}

async function rewriteExternalRefs(
    node: unknown,
    basePath: string,
    fileCache: Map<string, Record<string, unknown>>,
    schemas: Record<string, unknown>,
    refToSchemaName: Map<string, string>,
    visited: Set<string>,
    sourceFilePath?: string
): Promise<void> {
    if (node == null || typeof node !== "object") {
        return;
    }

    if (Array.isArray(node)) {
        for (const item of node) {
            await rewriteExternalRefs(item, basePath, fileCache, schemas, refToSchemaName, visited, sourceFilePath);
        }
        return;
    }

    const record = node as Record<string, unknown>;

    if (typeof record.$ref === "string") {
        if (!record.$ref.startsWith("#")) {
            await importExternalRef(record, basePath, fileCache, schemas, refToSchemaName, visited);
            return;
        }

        if (sourceFilePath != null && !record.$ref.startsWith("#/components/")) {
            await importIntraFileRef(record, sourceFilePath, fileCache, schemas, refToSchemaName, visited);
        }
        return;
    }

    for (const value of Object.values(record)) {
        await rewriteExternalRefs(value, basePath, fileCache, schemas, refToSchemaName, visited, sourceFilePath);
    }
}

async function importExternalRef(
    record: Record<string, unknown>,
    basePath: string,
    fileCache: Map<string, Record<string, unknown>>,
    schemas: Record<string, unknown>,
    refToSchemaName: Map<string, string>,
    visited: Set<string>
): Promise<void> {
    const refValue = record.$ref as string;
    const hashIndex = refValue.indexOf("#");
    const filePath = hashIndex >= 0 ? refValue.substring(0, hashIndex) : refValue;
    const pointer = hashIndex >= 0 ? refValue.substring(hashIndex + 1) : undefined;
    const absoluteRefPath = path.resolve(basePath, filePath);
    const cacheKey = `${absoluteRefPath}#${pointer ?? ""}`;

    const existingName = refToSchemaName.get(cacheKey);
    if (existingName != null) {
        record.$ref = `#/components/schemas/${existingName}`;
        return;
    }

    const fileParsed = await loadExternalFile(absoluteRefPath, fileCache);
    if (fileParsed == null) {
        return;
    }

    const resolved = followPointer(fileParsed, pointer);
    if (resolved == null || typeof resolved !== "object") {
        return;
    }

    const baseName = deriveSchemaName(pointer, filePath);
    if (baseName == null) {
        return;
    }

    const existingEntry = findSchemaKeyForRecord(schemas, record);
    const schemaName = existingEntry ?? getUniqueSchemaName(schemas, baseName);
    refToSchemaName.set(cacheKey, schemaName);

    if (existingEntry != null) {
        const cloned = structuredClone(resolved) as Record<string, unknown>;
        delete record.$ref;
        for (const key of Object.keys(record)) {
            delete record[key];
        }
        for (const [key, value] of Object.entries(cloned)) {
            record[key] = value;
        }
        schemas[schemaName] = record;
    } else {
        schemas[schemaName] = structuredClone(resolved);
    }

    if (!visited.has(cacheKey)) {
        visited.add(cacheKey);
        await rewriteExternalRefs(
            schemas[schemaName],
            path.dirname(absoluteRefPath),
            fileCache,
            schemas,
            refToSchemaName,
            visited,
            absoluteRefPath
        );
    }

    if (existingEntry == null) {
        record.$ref = `#/components/schemas/${schemaName}`;
    }
}

async function importIntraFileRef(
    record: Record<string, unknown>,
    sourceFilePath: string,
    fileCache: Map<string, Record<string, unknown>>,
    schemas: Record<string, unknown>,
    refToSchemaName: Map<string, string>,
    visited: Set<string>
): Promise<void> {
    const refValue = record.$ref as string;
    const pointer = refValue.substring(1);
    const cacheKey = `${sourceFilePath}#${pointer}`;

    const existingName = refToSchemaName.get(cacheKey);
    if (existingName != null) {
        record.$ref = `#/components/schemas/${existingName}`;
        return;
    }

    const fileParsed = fileCache.get(sourceFilePath);
    if (fileParsed == null) {
        return;
    }

    const resolved = followPointer(fileParsed, pointer);
    if (resolved == null || typeof resolved !== "object") {
        return;
    }

    const baseName = deriveSchemaName(pointer, sourceFilePath);
    if (baseName == null) {
        return;
    }
    const schemaName = getUniqueSchemaName(schemas, baseName);
    refToSchemaName.set(cacheKey, schemaName);

    schemas[schemaName] = structuredClone(resolved);

    if (!visited.has(cacheKey)) {
        visited.add(cacheKey);
        await rewriteExternalRefs(
            schemas[schemaName],
            path.dirname(sourceFilePath),
            fileCache,
            schemas,
            refToSchemaName,
            visited,
            sourceFilePath
        );
    }

    record.$ref = `#/components/schemas/${schemaName}`;
}

async function loadExternalFile(
    absolutePath: string,
    fileCache: Map<string, Record<string, unknown>>
): Promise<Record<string, unknown> | undefined> {
    const cached = fileCache.get(absolutePath);
    if (cached != null) {
        return cached;
    }
    try {
        const content = (await readFile(absolutePath)).toString();
        const parsed = yaml.load(content) as Record<string, unknown>;
        fileCache.set(absolutePath, parsed);
        return parsed;
    } catch {
        return undefined;
    }
}

function followPointer(obj: unknown, pointer: string | undefined): unknown {
    if (pointer == null) {
        return obj;
    }
    let current = obj;
    const keys = pointer.split("/").filter((k) => k !== "");
    for (const key of keys) {
        if (current == null || typeof current !== "object") {
            return undefined;
        }
        current = (current as Record<string, unknown>)[key];
    }
    return current;
}

function deriveSchemaName(pointer: string | undefined, filePath: string): string | undefined {
    if (pointer != null) {
        const segments = pointer.split("/").filter((s) => s !== "");
        if (segments.length > 0) {
            return segments[segments.length - 1];
        }
    }
    const basename = path.basename(filePath);
    const dotIndex = basename.indexOf(".");
    return dotIndex >= 0 ? basename.substring(0, dotIndex) : basename;
}

function findSchemaKeyForRecord(
    schemas: Record<string, unknown>,
    record: Record<string, unknown>
): string | undefined {
    for (const [key, value] of Object.entries(schemas)) {
        if (value === record) {
            return key;
        }
    }
    return undefined;
}

function getUniqueSchemaName(schemas: Record<string, unknown>, baseName: string): string {
    if (schemas[baseName] == null) {
        return baseName;
    }
    let counter = 2;
    while (schemas[`${baseName}_${counter}`] != null) {
        counter++;
    }
    return `${baseName}_${counter}`;
}
