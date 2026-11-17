import { mkdir, readFile, writeFile } from "node:fs/promises";
import { getFernDirectory, SDK_CONFIG_FILENAME } from "@fern-api/configuration-loader";
import { dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import type { CliContext } from "../../cli-context/CliContext";
import { addMcpCustomCodeToSdkConfig, type McpCustomCodeEdit } from "./editMcpGeneration.js";
import { customToolModule, customToolRelativePath, hookModule, hookRelativePath } from "./templates.js";

const TOOL_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export async function addCustomTool({
    name,
    force,
    cliContext
}: {
    name: string;
    force: boolean;
    cliContext: CliContext;
}): Promise<void> {
    if (!TOOL_NAME_PATTERN.test(name)) {
        return cliContext.failAndThrow(
            `Invalid tool name "${name}". Use letters, digits, and underscores, starting with a letter.`
        );
    }
    const relativePath = customToolRelativePath(name);
    await scaffold({
        relativePath,
        contents: customToolModule(name),
        edit: { kind: "tool", name, path: relativePath },
        force,
        cliContext
    });
    cliContext.logger.info(
        `Scaffolded custom tool "${name}": wrote ${relativePath} and added customTools.${name} to ${SDK_CONFIG_FILENAME}.`
    );
}

export async function addHook({ force, cliContext }: { force: boolean; cliContext: CliContext }): Promise<void> {
    const relativePath = hookRelativePath();
    await scaffold({
        relativePath,
        contents: hookModule(),
        edit: { kind: "hook", path: relativePath },
        force,
        cliContext
    });
    cliContext.logger.info(`Scaffolded hooks module: wrote ${relativePath} and added hooks to ${SDK_CONFIG_FILENAME}.`);
}

async function scaffold({
    relativePath,
    contents,
    edit,
    force,
    cliContext
}: {
    relativePath: string;
    contents: string;
    edit: McpCustomCodeEdit;
    force: boolean;
    cliContext: CliContext;
}): Promise<void> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return cliContext.failAndThrow("No fern directory found. Run this command inside a Fern project.");
    }
    const sdkConfigPath = join(fernDirectory, RelativeFilePath.of(SDK_CONFIG_FILENAME));
    if (!(await doesPathExist(sdkConfigPath))) {
        return cliContext.failAndThrow(
            `No ${SDK_CONFIG_FILENAME} found at ${sdkConfigPath}. This command augments an existing MCP target; create one first.`
        );
    }

    const modulePath = join(fernDirectory, RelativeFilePath.of(relativePath));
    if ((await doesPathExist(modulePath)) && !force) {
        return cliContext.failAndThrow(`${modulePath} already exists. Re-run with --force to overwrite it.`);
    }

    const existingContents = await readFile(sdkConfigPath, "utf8");
    // Edit + validate the config first so a config error leaves no half-written stub behind.
    let updatedConfig: string;
    try {
        updatedConfig = addMcpCustomCodeToSdkConfig({ existingContents, edit, configPath: sdkConfigPath, force });
    } catch (error) {
        return cliContext.failAndThrow(error instanceof Error ? error.message : undefined, error);
    }

    await mkdir(dirname(modulePath), { recursive: true });
    await writeFile(modulePath, contents);
    await writeFile(sdkConfigPath, updatedConfig);
}
