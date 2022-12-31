import execa from "execa";
import { readdir, writeFile } from "fs/promises";
import path from "path";

export async function installAndCompileGeneratedProject(pathToDirectory: string): Promise<void> {
    const runYarnCommand = async (args: string[], env?: Record<string, string>) => {
        await execa("yarn", args, {
            cwd: pathToDirectory,
            env,
        });
    };

    // write empty yarn.lock so yarn knows it's a standalone project
    await writeFile(path.join(pathToDirectory, "yarn.lock"), "");

    await runYarnCommand(["set", "version", "berry"]);
    await runYarnCommand(["config", "set", "nodeLinker", "pnp"]);
    await runYarnCommand(["install"], {
        // set enableImmutableInstalls=false so we can modify yarn.lock, even when in CI
        YARN_ENABLE_IMMUTABLE_INSTALLS: "false",
    });
    await runYarnCommand(["build"]);
}

export async function installAndCompileGeneratedProjects(parent: string): Promise<void> {
    const files = await readdir(parent, { withFileTypes: true });
    await Promise.all(
        files.map(async (file) => {
            if (file.isDirectory()) {
                const pathToDirectory = path.join(parent, file.name);
                await installAndCompileGeneratedProject(pathToDirectory);
            }
        })
    );
}
