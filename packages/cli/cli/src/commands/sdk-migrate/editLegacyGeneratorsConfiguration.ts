import { generatorsYml } from "@fern-api/configuration-loader";
import { CliError } from "@fern-api/task-context";
import YAML, { isMap, isScalar, isSeq, type Pair, type YAMLMap } from "yaml";

import type { MigrationGroupSelection } from "./selectMigrationTarget.js";

interface Replacement {
    end: number;
    start: number;
    value: string;
}

/**
 * Comments migrated declarations in-place instead of serializing generators.yml again. This is
 * deliberately source-oriented: every byte outside a migrated declaration remains untouched.
 */
export function editLegacyGeneratorsConfiguration({
    contents,
    sdkConfigPath,
    selections
}: {
    contents: string;
    sdkConfigPath: string;
    selections: MigrationGroupSelection[];
}): string {
    const document = YAML.parseDocument(contents, { keepSourceTokens: true });
    assertValidDocument(document.errors, "legacy generators configuration");
    if (!isMap(document.contents)) {
        throw configError("Expected the legacy generators configuration to be a YAML map.");
    }

    const root = document.contents;
    const groupsPair = findPair(root, "groups");
    if (groupsPair == null || !isMap(groupsPair.value)) {
        throw configError("Expected 'groups' to be a map in the legacy generators configuration.");
    }

    const selectedEntireGroups = new Set(
        selections.filter((selection) => selection.isEntireGroup).map((selection) => selection.groupName)
    );
    const groupNames = groupsPair.value.items.flatMap((pair) => {
        const name = scalarString(pair.key);
        return name == null ? [] : [name];
    });
    const migrateEveryGroup =
        groupNames.length > 0 && groupNames.every((groupName) => selectedEntireGroups.has(groupName));
    const replacements: Replacement[] = [];

    if (migrateEveryGroup) {
        const range = pairLineRange(contents, groupsPair);
        const originalGroups = restorePartiallyMigratedGeneratorBlocks(contents.slice(range.start, range.end));
        replacements.push({
            ...range,
            value: `groups: {}\n${migrationHeader("All SDK generator groups", sdkConfigPath, "")}${commentBlock(originalGroups)}`
        });
    } else {
        for (const selection of selections) {
            const groupPair = findPair(groupsPair.value, selection.groupName);
            if (groupPair == null || !isMap(groupPair.value)) {
                throw configError(`Could not locate SDK group '${selection.groupName}' in the legacy YAML.`);
            }
            if (selection.isEntireGroup) {
                const range = pairLineRange(contents, groupPair);
                const indent = indentationAt(contents, range.start);
                const originalGroup = restorePartiallyMigratedGeneratorBlocks(contents.slice(range.start, range.end));
                replacements.push({
                    ...range,
                    value: `${migrationHeader(`Group '${selection.groupName}'`, sdkConfigPath, indent)}${commentBlock(originalGroup)}`
                });
                continue;
            }

            const generatorsPair = findPair(groupPair.value, "generators");
            if (generatorsPair == null || !isSeq(generatorsPair.value)) {
                throw configError(`Expected group '${selection.groupName}' to contain a generators list.`);
            }
            const sequenceToken = generatorsPair.value.srcToken as
                | { items?: Array<{ start?: Array<{ offset?: number; type?: string }> }> }
                | undefined;
            for (const generatorIndex of selection.generatorIndexes) {
                const generatorNode = generatorsPair.value.items[generatorIndex];
                const generatorRange = sourceRange(generatorNode);
                const itemToken = sequenceToken?.items?.[generatorIndex];
                const dash = itemToken?.start?.find((token) => token.type === "seq-item-ind");
                if (generatorRange == null || dash?.offset == null) {
                    throw configError(
                        `Could not locate generator ${generatorIndex} in group '${selection.groupName}' in the legacy YAML.`
                    );
                }
                const range = lineRange(contents, dash.offset, generatorRange[2]);
                const indent = indentationAt(contents, range.start);
                replacements.push({
                    ...range,
                    value: `${indent}# Migrated to ${sdkConfigPath}.\n${commentBlock(contents.slice(range.start, range.end))}`
                });
            }
        }
    }

    if (selectedEntireGroups.size > 0) {
        addDefaultGroupReplacement({
            contents,
            root,
            replacements,
            sdkConfigPath,
            selectedEntireGroups
        });
        addAliasesReplacement({
            contents,
            root,
            replacements,
            sdkConfigPath,
            selectedEntireGroups
        });
    }

    assertNoOverlappingReplacements(replacements);
    const updated = replacements
        .sort((left, right) => right.start - left.start)
        .reduce(
            (result, replacement) =>
                `${result.slice(0, replacement.start)}${replacement.value}${result.slice(replacement.end)}`,
            contents
        );
    const updatedDocument = YAML.parseDocument(updated);
    assertValidDocument(updatedDocument.errors, "migrated legacy generators configuration");
    const updatedValue = updatedDocument.toJS();
    assertActiveReferences(updatedValue);
    assertLegacySchema(updatedValue);
    return updated;
}

function addDefaultGroupReplacement({
    contents,
    root,
    replacements,
    sdkConfigPath,
    selectedEntireGroups
}: {
    contents: string;
    root: YAMLMap;
    replacements: Replacement[];
    sdkConfigPath: string;
    selectedEntireGroups: Set<string>;
}): void {
    const pair = findPair(root, "default-group");
    const defaultGroup = pair == null ? undefined : scalarString(pair.value);
    if (pair == null || defaultGroup == null || !selectedEntireGroups.has(defaultGroup)) {
        return;
    }
    const range = pairLineRange(contents, pair);
    replacements.push({
        ...range,
        value: `${migrationHeader("Default group", sdkConfigPath, indentationAt(contents, range.start))}${commentBlock(contents.slice(range.start, range.end))}`
    });
}

function addAliasesReplacement({
    contents,
    root,
    replacements,
    sdkConfigPath,
    selectedEntireGroups
}: {
    contents: string;
    root: YAMLMap;
    replacements: Replacement[];
    sdkConfigPath: string;
    selectedEntireGroups: Set<string>;
}): void {
    const pair = findPair(root, "aliases");
    if (pair == null || !isMap(pair.value)) {
        return;
    }
    const aliases = pair.value.toJSON() as Record<string, unknown>;
    const referencesMigratedGroup = Object.values(aliases).some(
        (groups) => Array.isArray(groups) && groups.some((group) => selectedEntireGroups.has(String(group)))
    );
    if (!referencesMigratedGroup) {
        return;
    }
    const remainingAliases = Object.fromEntries(
        Object.entries(aliases).flatMap(([name, groups]) => {
            if (!Array.isArray(groups)) {
                return [];
            }
            const remaining = groups.map(String).filter((group) => !selectedEntireGroups.has(group));
            return remaining.length === 0 ? [] : [[name, remaining]];
        })
    );
    const range = pairLineRange(contents, pair);
    const active =
        Object.keys(remainingAliases).length === 0
            ? ""
            : YAML.stringify({ aliases: remainingAliases }, { lineWidth: 0 });
    replacements.push({
        ...range,
        value: `${active}${migrationHeader("Group aliases", sdkConfigPath, "")}${commentBlock(contents.slice(range.start, range.end))}`
    });
}

function migrationHeader(subject: string, sdkConfigPath: string, indent: string): string {
    return (
        `${indent}# ${subject} migrated to ${sdkConfigPath}.\n` +
        `${indent}# Rollback: delete the migrated SDK Config targets, rename this file to generators.yml,\n` +
        `${indent}# and uncomment the preserved configuration below.\n` +
        `${indent}#\n`
    );
}

function commentBlock(value: string): string {
    return value.replace(/^([\t ]*)(?=\S)/gm, "$1# ");
}

function restorePartiallyMigratedGeneratorBlocks(value: string): string {
    const lines = value.match(/[^\r\n]*(?:\r\n|\n|$)/g)?.filter((line) => line.length > 0) ?? [];
    const restored: string[] = [];
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const marker = line == null ? null : /^([\t ]*)# Migrated to .+\.\r?\n?$/.exec(line);
        if (marker == null) {
            if (line != null) {
                restored.push(line);
            }
            continue;
        }

        const markerIndent = marker[1] ?? "";
        while (index + 1 < lines.length) {
            const next = lines[index + 1];
            if (next == null || /^([\t ]*)# Migrated to .+\.\r?\n?$/.test(next)) {
                break;
            }
            if (/^[\t ]*(?:\r?\n)?$/.test(next)) {
                restored.push(next);
                index += 1;
                continue;
            }
            const commented = /^([\t ]*)# ?/.exec(next);
            if (commented == null || !(commented[1] ?? "").startsWith(markerIndent)) {
                break;
            }
            restored.push(next.replace(/^([\t ]*)# ?/, "$1"));
            index += 1;
        }
    }
    return restored.join("");
}

function findPair(map: YAMLMap, key: string): Pair | undefined {
    return map.items.find((pair) => scalarString(pair.key) === key);
}

function scalarString(value: unknown): string | undefined {
    return isScalar(value) && typeof value.value === "string" ? value.value : undefined;
}

function pairLineRange(contents: string, pair: Pair): Pick<Replacement, "start" | "end"> {
    const keyRange = sourceRange(pair.key);
    const valueRange = sourceRange(pair.value);
    if (keyRange == null || valueRange == null) {
        throw configError("Could not determine YAML source ranges for migration.");
    }
    return lineRange(contents, keyRange[0], valueRange[2]);
}

function sourceRange(value: unknown): [number, number, number] | undefined {
    if (typeof value !== "object" || value == null || !("range" in value) || !Array.isArray(value.range)) {
        return undefined;
    }
    const [start, valueEnd, nodeEnd] = value.range;
    return typeof start === "number" && typeof valueEnd === "number" && typeof nodeEnd === "number"
        ? [start, valueEnd, nodeEnd]
        : undefined;
}

function lineRange(contents: string, startOffset: number, endOffset: number): Pick<Replacement, "start" | "end"> {
    const previousNewline = contents.lastIndexOf("\n", Math.max(0, startOffset - 1));
    const start = previousNewline < 0 ? 0 : previousNewline + 1;
    const nextNewline = contents.indexOf("\n", endOffset);
    const end = contents[endOffset - 1] === "\n" ? endOffset : nextNewline < 0 ? contents.length : nextNewline + 1;
    return { start, end };
}

function indentationAt(contents: string, offset: number): string {
    return /^[\t ]*/.exec(contents.slice(offset))?.[0] ?? "";
}

function assertNoOverlappingReplacements(replacements: Replacement[]): void {
    const ordered = [...replacements].sort((left, right) => left.start - right.start);
    for (let index = 1; index < ordered.length; index++) {
        const previous = ordered[index - 1];
        const current = ordered[index];
        if (previous != null && current != null && current.start < previous.end) {
            throw configError("Migration changes overlap; the selected legacy configuration is ambiguous.");
        }
    }
}

function assertActiveReferences(value: unknown): void {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
        throw configError("The migrated legacy generators configuration must remain a YAML map.");
    }
    const root = value as Record<string, unknown>;
    const groups =
        root.groups != null && typeof root.groups === "object" && !Array.isArray(root.groups)
            ? new Set(Object.keys(root.groups))
            : new Set<string>();
    if (typeof root["default-group"] === "string" && !groups.has(root["default-group"])) {
        throw configError(`Active default-group '${root["default-group"]}' no longer references an active group.`);
    }
    if (root.aliases != null && typeof root.aliases === "object" && !Array.isArray(root.aliases)) {
        for (const [alias, values] of Object.entries(root.aliases)) {
            if (!Array.isArray(values)) {
                throw configError(`Active alias '${alias}' is not a list of groups.`);
            }
            const missing = values.find((group) => typeof group !== "string" || !groups.has(group));
            if (missing != null) {
                throw configError(`Active alias '${alias}' references missing group '${String(missing)}'.`);
            }
        }
    }
}

function assertValidDocument(errors: readonly Error[], description: string): void {
    if (errors.length > 0) {
        throw configError(`Could not parse the ${description}: ${errors.map((error) => error.message).join("; ")}`);
    }
}

function assertLegacySchema(value: unknown): void {
    const parsed = generatorsYml.serialization.GeneratorsConfigurationSchema.parse(value, {
        allowUnrecognizedEnumValues: false,
        allowUnrecognizedUnionMembers: false,
        breadcrumbsPrefix: undefined,
        omitUndefined: false,
        skipValidation: false,
        unrecognizedObjectKeys: "fail"
    });
    if (!parsed.ok) {
        throw configError(
            `The migrated legacy generators configuration is invalid: ${parsed.errors.map((error) => error.message).join("; ")}`
        );
    }
}

function configError(message: string): CliError {
    return new CliError({ message, code: CliError.Code.ConfigError });
}
