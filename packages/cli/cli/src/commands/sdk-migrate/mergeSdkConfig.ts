import { isDeepStrictEqual } from "node:util";
import { CliError } from "@fern-api/task-context";
import { validateSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import YAML, { type Document, isSeq } from "yaml";

import type { MappingResult } from "./mapFernGroupToSdkConfig.js";

export function mergeSdkConfig({
    existingContents,
    mapped,
    outputPath
}: {
    existingContents: string | undefined;
    mapped: MappingResult;
    outputPath: string;
}): string {
    if (existingContents == null) {
        return ensureTrailingNewline(YAML.stringify(mapped.sdkConfig, { lineWidth: 0 }));
    }

    const document = YAML.parseDocument(existingContents);
    if (document.errors.length > 0) {
        throw configError(
            `Could not parse existing SDK Config at ${outputPath}: ${document.errors.map((error) => error.message).join("; ")}`
        );
    }

    let existing: ReturnType<typeof validateSdkConfigV1>;
    try {
        existing = validateSdkConfigV1(document.toJS());
    } catch (error) {
        throw configError(`Existing SDK Config at ${outputPath} is invalid: ${errorMessage(error)}`);
    }

    const existingRoot = withoutTargets(existing);
    const migratedRoot = withoutTargets(mapped.sdkConfig);
    const rootConflicts = findRootConflicts(existingRoot, migratedRoot);
    if (rootConflicts.length > 0) {
        throw configError(
            `Cannot merge into ${outputPath}: the following shared settings differ from the selected legacy generators: ${rootConflicts.join(", ")}.`
        );
    }
    addMissingRootSettings(document, existingRoot, migratedRoot);

    const duplicatedExistingLanguages = duplicateValues(existing.targets.map((target) => target.language));
    if (duplicatedExistingLanguages.length > 0) {
        throw configError(
            `Cannot merge into ${outputPath}: it already contains multiple targets for ${duplicatedExistingLanguages.join(", ")}. Each language can have only one target per SDK Config file.`
        );
    }
    const existingLanguages = new Set(existing.targets.map((target) => target.language));
    const duplicateLanguages = mapped.sdkConfig.targets
        .map((target) => target.language)
        .filter((language) => existingLanguages.has(language));
    if (duplicateLanguages.length > 0) {
        throw configError(
            `Cannot migrate ${[...new Set(duplicateLanguages)].join(", ")} into ${outputPath}: each language can have only one target per SDK Config file. The selected target is already migrated or owned by another target.`
        );
    }

    const targets = document.get("targets", true);
    if (!isSeq(targets)) {
        throw configError(`Existing SDK Config at ${outputPath} must contain a targets list.`);
    }
    for (const target of mapped.sdkConfig.targets) {
        targets.add(target);
    }
    try {
        validateSdkConfigV1(document.toJS());
    } catch (error) {
        throw configError(`Merged SDK Config at ${outputPath} is invalid: ${errorMessage(error)}`);
    }
    return ensureTrailingNewline(document.toString({ lineWidth: 0 }));
}

function duplicateValues(values: string[]): string[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const value of values) {
        if (seen.has(value)) {
            duplicates.add(value);
        }
        seen.add(value);
    }
    return [...duplicates];
}

function withoutTargets(config: ReturnType<typeof validateSdkConfigV1>): unknown {
    const { targets: _targets, ...root } = config;
    return root;
}

const STRICT_ROOT_KEYS = new Set(["api", "replay", "schemaVersion", "sdkName", "source"]);

function findRootConflicts(existing: unknown, migrated: unknown): string[] {
    if (!isRecord(existing) || !isRecord(migrated)) {
        return isDeepStrictEqual(existing, migrated) ? [] : ["SDK Config root"];
    }
    const conflicts: string[] = [];
    for (const key of new Set([...Object.keys(existing), ...Object.keys(migrated)])) {
        collectConflicts(existing[key], migrated[key], [key], STRICT_ROOT_KEYS.has(key), conflicts);
    }
    return conflicts;
}

function collectConflicts(
    existing: unknown,
    migrated: unknown,
    path: string[],
    missingIsConflict: boolean,
    conflicts: string[]
): void {
    if (isDeepStrictEqual(existing, migrated)) {
        return;
    }
    if (existing === undefined || migrated === undefined) {
        if (missingIsConflict) {
            conflicts.push(path.join("."));
        }
        return;
    }
    if (isRecord(existing) && isRecord(migrated)) {
        for (const key of new Set([...Object.keys(existing), ...Object.keys(migrated)])) {
            collectConflicts(existing[key], migrated[key], [...path, key], missingIsConflict, conflicts);
        }
        return;
    }
    conflicts.push(path.join("."));
}

function addMissingRootSettings(document: Document, existing: unknown, migrated: unknown): void {
    if (!isRecord(existing) || !isRecord(migrated)) {
        return;
    }
    addMissingValues(document, existing, migrated, []);
}

function addMissingValues(
    document: Document,
    existing: Record<string, unknown>,
    migrated: Record<string, unknown>,
    path: string[]
): void {
    for (const [key, migratedValue] of Object.entries(migrated)) {
        const existingValue = existing[key];
        const valuePath = [...path, key];
        if (existingValue === undefined) {
            document.setIn(valuePath, migratedValue);
        } else if (isRecord(existingValue) && isRecord(migratedValue)) {
            addMissingValues(document, existingValue, migratedValue, valuePath);
        }
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

function ensureTrailingNewline(value: string): string {
    return value.endsWith("\n") ? value : `${value}\n`;
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function configError(message: string): CliError {
    return new CliError({ message, code: CliError.Code.ConfigError });
}
