import { generatorsYml } from "@fern-api/configuration";
import { getPathToGeneratorsConfiguration, loadRawGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";

import { ToolSelector, ToolsConfig } from "./toolset.js";

export const MCP_GENERATOR_NAME = "fernapi/fern-mcp-server";
export const MCP_GENERATOR_VERSION = "0.1.0";
export const DEFAULT_MCP_GROUP_NAME = "mcp";
export const GENERATORS_YML_SCHEMA_COMMENT =
    "# yaml-language-server: $schema=https://schema.buildwithfern.dev/generators-yml.json\n";

/** The `config:` block written on a `fernapi/fern-mcp-server` generator entry. */
export interface McpGeneratorConfig {
    "server-name": string;
    instructions?: string;
    tools?: McpToolsBlock;
}

export interface McpToolsBlock extends ToolsConfig {
    presets?: Record<string, ToolsConfig>;
}

export interface McpGeneratorEntry {
    groupName: string;
    config: McpGeneratorConfig;
    outputLocation: string | undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

function asOptionalString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

function parseSelectors(value: unknown): ToolSelector[] | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }
    const selectors: ToolSelector[] = [];
    for (const entry of value) {
        if (!isRecord(entry)) {
            continue;
        }
        selectors.push({
            tag: asOptionalString(entry.tag),
            method: asOptionalString(entry.method),
            "operation-id": asOptionalString(entry["operation-id"]),
            "path-prefix": asOptionalString(entry["path-prefix"]),
            endpoint: asOptionalString(entry.endpoint)
        });
    }
    return selectors;
}

export function parseToolsConfig(value: unknown): ToolsConfig {
    if (!isRecord(value)) {
        return {};
    }
    return {
        intent: asOptionalString(value.intent),
        instructions: asOptionalString(value.instructions),
        include: parseSelectors(value.include),
        exclude: parseSelectors(value.exclude)
    };
}

function parsePresets(value: unknown): Record<string, ToolsConfig> | undefined {
    if (!isRecord(value)) {
        return undefined;
    }
    const presets: Record<string, ToolsConfig> = {};
    for (const [name, presetValue] of Object.entries(value)) {
        presets[name] = parseToolsConfig(presetValue);
    }
    return Object.keys(presets).length > 0 ? presets : undefined;
}

export function parseMcpGeneratorConfig(value: unknown): McpGeneratorConfig | undefined {
    if (!isRecord(value)) {
        return undefined;
    }
    const serverName = asOptionalString(value["server-name"]);
    if (serverName == null) {
        return undefined;
    }
    const toolsValue = isRecord(value.tools) ? value.tools : undefined;
    return {
        "server-name": serverName,
        instructions: asOptionalString(value.instructions),
        tools:
            toolsValue != null
                ? { ...parseToolsConfig(toolsValue), presets: parsePresets(toolsValue.presets) }
                : undefined
    };
}

function getOutputPath(output: generatorsYml.GeneratorOutputSchema | undefined): string | undefined {
    if (output == null) {
        return undefined;
    }
    return output.location === "local-file-system" ? output.path : output.location;
}

export function getMcpGeneratorEntries(
    rawConfiguration: generatorsYml.GeneratorsConfigurationSchema
): McpGeneratorEntry[] {
    const entries: McpGeneratorEntry[] = [];
    for (const [groupName, group] of Object.entries(rawConfiguration.groups ?? {})) {
        for (const generator of group.generators) {
            if (!("name" in generator) || generator.name !== MCP_GENERATOR_NAME) {
                continue;
            }
            const config = parseMcpGeneratorConfig(generator.config);
            if (config == null) {
                continue;
            }
            entries.push({
                groupName,
                config,
                outputLocation: getOutputPath(generator.output)
            });
        }
    }
    return entries;
}

function selectorToPlainObject(selector: ToolSelector): Record<string, string> {
    const plain: Record<string, string> = {};
    if (selector.tag != null) {
        plain.tag = selector.tag;
    }
    if (selector.method != null) {
        plain.method = selector.method;
    }
    if (selector["operation-id"] != null) {
        plain["operation-id"] = selector["operation-id"];
    }
    if (selector["path-prefix"] != null) {
        plain["path-prefix"] = selector["path-prefix"];
    }
    if (selector.endpoint != null) {
        plain.endpoint = selector.endpoint;
    }
    return plain;
}

export function toolsConfigToPlainObject(config: ToolsConfig): Record<string, unknown> {
    const plain: Record<string, unknown> = {};
    if (config.intent != null) {
        plain.intent = config.intent;
    }
    if (config.instructions != null) {
        plain.instructions = config.instructions;
    }
    if (config.include != null && config.include.length > 0) {
        plain.include = config.include.map(selectorToPlainObject);
    }
    if (config.exclude != null && config.exclude.length > 0) {
        plain.exclude = config.exclude.map(selectorToPlainObject);
    }
    return plain;
}

export interface FoundMcpGroup {
    config: McpGeneratorConfig;
    outputLocation: string | undefined;
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
}

/** Loads generators.yml and finds the MCP generator entry in the given group. */
export async function findMcpGroup({
    context,
    absolutePathToWorkspace,
    groupName
}: {
    context: TaskContext;
    absolutePathToWorkspace: AbsoluteFilePath;
    groupName: string;
}): Promise<FoundMcpGroup | undefined> {
    const absolutePathToGeneratorsConfiguration = await getPathToGeneratorsConfiguration({ absolutePathToWorkspace });
    if (absolutePathToGeneratorsConfiguration == null) {
        return undefined;
    }
    const rawConfiguration = await loadRawGeneratorsConfiguration({ absolutePathToWorkspace, context });
    if (rawConfiguration == null) {
        return undefined;
    }
    const entry = getMcpGeneratorEntries(rawConfiguration).find((candidate) => candidate.groupName === groupName);
    if (entry == null) {
        return undefined;
    }
    return {
        config: entry.config,
        outputLocation: entry.outputLocation,
        absolutePathToGeneratorsConfiguration
    };
}

export interface WriteMcpGroupResult {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    yamlBlock: string;
}

export async function writeMcpGroupToGeneratorsYml({
    absolutePathToWorkspace,
    context,
    groupName,
    serverName,
    toolsConfig,
    presets
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
    groupName: string;
    serverName: string;
    toolsConfig: ToolsConfig;
    presets?: Record<string, ToolsConfig>;
}): Promise<WriteMcpGroupResult | undefined> {
    const absolutePathToGeneratorsConfiguration = await getPathToGeneratorsConfiguration({ absolutePathToWorkspace });
    if (absolutePathToGeneratorsConfiguration == null) {
        return undefined;
    }
    // Validate the existing configuration (fails loudly on malformed YAML),
    // then mutate a plain parsed copy so unrelated keys are preserved verbatim.
    await loadRawGeneratorsConfiguration({ absolutePathToWorkspace, context });
    const parsedFile = yaml.load(await readFile(absolutePathToGeneratorsConfiguration, "utf-8"));

    const toolsBlock = toolsConfigToPlainObject({ ...toolsConfig, instructions: undefined });
    if (presets != null && Object.keys(presets).length > 0) {
        const presetsBlock: Record<string, unknown> = {};
        for (const [name, preset] of Object.entries(presets)) {
            presetsBlock[name] = toolsConfigToPlainObject(preset);
        }
        toolsBlock.presets = presetsBlock;
    }
    const generatorEntry: Record<string, unknown> = {
        name: MCP_GENERATOR_NAME,
        version: MCP_GENERATOR_VERSION,
        output: {
            location: "local-file-system",
            path: `../../generated/${groupName}`
        },
        config: {
            "server-name": serverName,
            ...(toolsConfig.instructions != null ? { instructions: toolsConfig.instructions } : {}),
            tools: toolsBlock
        }
    };

    const configurationAsRecord: Record<string, unknown> = isRecord(parsedFile) ? { ...parsedFile } : {};
    const groups = isRecord(configurationAsRecord.groups) ? { ...configurationAsRecord.groups } : {};
    const existingGroupValue = groups[groupName];
    const existingGroup = isRecord(existingGroupValue) ? existingGroupValue : undefined;
    const existingGenerators: unknown[] = Array.isArray(existingGroup?.generators) ? existingGroup.generators : [];
    const otherGenerators = existingGenerators.filter(
        (generator) => !(isRecord(generator) && generator.name === MCP_GENERATOR_NAME)
    );
    groups[groupName] = { ...existingGroup, generators: [...otherGenerators, generatorEntry] };
    configurationAsRecord.groups = groups;

    await writeFile(
        absolutePathToGeneratorsConfiguration,
        GENERATORS_YML_SCHEMA_COMMENT + yaml.dump(configurationAsRecord)
    );

    return {
        absolutePathToGeneratorsConfiguration,
        yamlBlock: yaml.dump({ groups: { [groupName]: { generators: [generatorEntry] } } })
    };
}
