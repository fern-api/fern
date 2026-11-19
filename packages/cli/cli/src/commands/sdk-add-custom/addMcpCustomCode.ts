import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { getFernDirectory, SDK_CONFIG_FILENAME } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import type { CliContext } from "../../cli-context/CliContext.js";
import { addMcpCustomCodeToSdkConfig, type McpCustomCodeEdit } from "./editMcpGeneration.js";
import { customToolModule, customToolRelativePath, hookModule, hookRelativePath } from "./templates.js";

const TOOL_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/;

/**
 * An SDK Config can live at the fern root (`fern/sdk-config.yml`) or inside an API workspace
 * (`fern/apis/<api>/sdk-config.yml`). Custom-code paths resolve against the config's own directory
 * (the workspace root), so we return that too.
 */
export async function locateSdkConfig(
    fernDirectory: AbsoluteFilePath,
    api: string | undefined
): Promise<{ sdkConfigPath: AbsoluteFilePath; baseDir: AbsoluteFilePath } | { error: string }> {
    if (api != null) {
        const apiConfig = join(fernDirectory, RelativeFilePath.of(`apis/${api}/${SDK_CONFIG_FILENAME}`));
        if (!(await doesPathExist(apiConfig))) {
            return { error: `No ${SDK_CONFIG_FILENAME} found for API "${api}" (looked at ${apiConfig}).` };
        }
        return { sdkConfigPath: apiConfig, baseDir: dirname(apiConfig) };
    }

    const atRoot = join(fernDirectory, RelativeFilePath.of(SDK_CONFIG_FILENAME));
    const apisDir = join(fernDirectory, RelativeFilePath.of("apis"));
    const apiDirs = (await doesPathExist(apisDir))
        ? (await readdir(apisDir, { withFileTypes: true })).filter((entry) => entry.isDirectory())
        : [];
    const apiConfigs = (
        await Promise.all(
            apiDirs.map(async (entry) => {
                const candidate = join(apisDir, RelativeFilePath.of(`${entry.name}/${SDK_CONFIG_FILENAME}`));
                return (await doesPathExist(candidate)) ? candidate : undefined;
            })
        )
    ).filter((candidate): candidate is AbsoluteFilePath => candidate != null);
    const candidates = [...((await doesPathExist(atRoot)) ? [atRoot] : []), ...apiConfigs];

    const [first, ...rest] = candidates;
    if (first == null) {
        return {
            error: `No ${SDK_CONFIG_FILENAME} found in ${fernDirectory} (root or apis/*/). This command augments an existing MCP target; create one first.`
        };
    }
    if (rest.length > 0) {
        return {
            error: `Found multiple ${SDK_CONFIG_FILENAME} files (${candidates.join(", ")}). Re-run with --api <name> to pick one.`
        };
    }
    return { sdkConfigPath: first, baseDir: dirname(first) };
}

export async function addCustomTool({
    name,
    api,
    force,
    cliContext
}: {
    name: string;
    api: string | undefined;
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
        api,
        force,
        cliContext
    });
    cliContext.logger.info(
        `Scaffolded custom tool "${name}": wrote ${relativePath} and added customTools.${name} to ${SDK_CONFIG_FILENAME}.`
    );
}

export async function addHook({
    api,
    force,
    cliContext
}: {
    api: string | undefined;
    force: boolean;
    cliContext: CliContext;
}): Promise<void> {
    const relativePath = hookRelativePath();
    await scaffold({
        relativePath,
        contents: hookModule(),
        edit: { kind: "hook", path: relativePath },
        api,
        force,
        cliContext
    });
    cliContext.logger.info(`Scaffolded hooks module: wrote ${relativePath} and added hooks to ${SDK_CONFIG_FILENAME}.`);
}

async function scaffold({
    relativePath,
    contents,
    edit,
    api,
    force,
    cliContext
}: {
    relativePath: string;
    contents: string;
    edit: McpCustomCodeEdit;
    api: string | undefined;
    force: boolean;
    cliContext: CliContext;
}): Promise<void> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return cliContext.failAndThrow("No fern directory found. Run this command inside a Fern project.");
    }
    const located = await locateSdkConfig(fernDirectory, api);
    if ("error" in located) {
        return cliContext.failAndThrow(located.error);
    }
    const { sdkConfigPath, baseDir } = located;

    const modulePath = join(baseDir, RelativeFilePath.of(relativePath));
    const moduleExisted = await doesPathExist(modulePath);
    if (moduleExisted && !force) {
        return cliContext.failAndThrow(`${modulePath} already exists. Re-run with --force to overwrite it.`);
    }

    const existingContents = await readFile(sdkConfigPath, "utf8");
    // Compute + validate the updated config first, so a config error leaves no file written at all.
    let updatedConfig: string;
    try {
        updatedConfig = addMcpCustomCodeToSdkConfig({ existingContents, edit, configPath: sdkConfigPath, force });
    } catch (error) {
        return cliContext.failAndThrow(error instanceof Error ? error.message : undefined, error);
    }

    await mkdir(dirname(modulePath), { recursive: true });
    await writeFile(modulePath, contents);
    // Keep the two writes consistent: if registering the module in the config fails, roll back a
    // stub we just created so the user isn't left with an orphaned, unregistered file.
    try {
        await writeFile(sdkConfigPath, updatedConfig);
    } catch (error) {
        if (!moduleExisted) {
            await rm(modulePath, { force: true });
        }
        return cliContext.failAndThrow(`Wrote ${modulePath} but failed to update ${SDK_CONFIG_FILENAME}.`, error);
    }
}
