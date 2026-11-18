import { errorMessageOrString } from "@fern-api/core-utils";
import { validateSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import YAML, { isMap, isSeq } from "yaml";

export type McpCustomCodeEdit = { kind: "tool"; name: string; path: string } | { kind: "hook"; path: string };

/**
 * Inserts a `customTools.<name>` or `hooks` entry into the `generation` block of the SDK Config's
 * single `language: mcp` target, preserving the file's existing comments and formatting (AST edit,
 * not a reserialize), and re-validates the result. Returns the updated file contents.
 */
export function addMcpCustomCodeToSdkConfig({
    existingContents,
    edit,
    configPath,
    force
}: {
    existingContents: string;
    edit: McpCustomCodeEdit;
    configPath: string;
    force: boolean;
}): string {
    const document = YAML.parseDocument(existingContents);
    if (document.errors.length > 0) {
        throw new Error(`Could not parse ${configPath}: ${document.errors.map((error) => error.message).join("; ")}`);
    }

    const mcpTarget = findMcpTarget(document, configPath);
    const generation = getOrCreateMap(document, mcpTarget, "generation", configPath);

    if (edit.kind === "tool") {
        const customTools = getOrCreateMap(document, generation, "customTools", configPath);
        if (customTools.has(edit.name) && !force) {
            throw new Error(
                `customTools.${edit.name} is already configured in ${configPath}. Re-run with --force to overwrite it.`
            );
        }
        customTools.set(edit.name, document.createNode({ path: edit.path }));
    } else {
        // Guard on existence regardless of node shape (map, scalar, etc.), mirroring the customTools check.
        if (generation.get("hooks", true) != null && !force) {
            throw new Error(`hooks is already configured in ${configPath}. Re-run with --force to overwrite it.`);
        }
        generation.set("hooks", document.createNode({ path: edit.path }));
    }

    try {
        validateSdkConfigV1(document.toJS());
    } catch (error) {
        throw new Error(`Updated SDK Config at ${configPath} is invalid: ${errorMessageOrString(error)}`);
    }
    return ensureTrailingNewline(document.toString({ lineWidth: 0 }));
}

function findMcpTarget(document: YAML.Document, configPath: string): YAML.YAMLMap {
    const targets = document.get("targets", true);
    if (!isSeq(targets)) {
        throw new Error(`${configPath} has no \`targets\` list. Add a \`language: mcp\` target first.`);
    }
    const mcpTargets = targets.items.filter(
        (item): item is YAML.YAMLMap => isMap(item) && item.get("language") === "mcp"
    );
    const [mcpTarget, ...rest] = mcpTargets;
    if (mcpTarget == null) {
        throw new Error(
            `No \`language: mcp\` target found in ${configPath}. Add an MCP target before scaffolding custom tools or hooks.`
        );
    }
    if (rest.length > 0) {
        throw new Error(`Found ${mcpTargets.length} \`language: mcp\` targets in ${configPath}; expected exactly one.`);
    }
    return mcpTarget;
}

function getOrCreateMap(document: YAML.Document, parent: YAML.YAMLMap, key: string, configPath: string): YAML.YAMLMap {
    const existing = parent.get(key, true);
    if (isMap(existing)) {
        return existing;
    }
    if (existing != null) {
        throw new Error(`Expected \`${key}\` in ${configPath} to be a mapping.`);
    }
    parent.set(key, document.createNode({}));
    const created = parent.get(key, true);
    if (!isMap(created)) {
        throw new Error(`Failed to create the \`${key}\` mapping in ${configPath}.`);
    }
    return created;
}

function ensureTrailingNewline(contents: string): string {
    return contents.endsWith("\n") ? contents : `${contents}\n`;
}
