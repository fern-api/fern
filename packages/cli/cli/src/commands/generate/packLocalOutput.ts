import { generatorsYml } from "@fern-api/configuration-loader";
import { assertNever, ContainerRunner } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { createWriteStream } from "fs";
import { copyFile, mkdir, readdir, readFile, rename, rm, rmdir } from "fs/promises";
import { basename } from "path";
import { ZipFile } from "yazl";

/** Directory (inside each generator's local output) where packaged artifacts are written. */
export const PACK_OUTPUT_DIRECTORY = "fern-dist";

/** Where the packaging toolchain runs: on the host machine, or inside a Docker toolchain image. */
export type PackMode = "host" | "docker";

/** Official toolchain images used when packing with `--package-mode docker`. */
const PACK_DOCKER_IMAGES: Record<string, string> = {
    typescript: "node:22",
    python: "python:3.12",
    java: "gradle:8-jdk17",
    csharp: "mcr.microsoft.com/dotnet/sdk:9.0",
    ruby: "ruby:3.3",
    php: "composer:2",
    rust: "rust:1"
};

/**
 * Builds distributable package artifacts (e.g. an npm tarball, Python wheel, JAR, NuGet package,
 * or gem) for every generator in the group that wrote its output to the local file system.
 * Artifacts land in `<output>/fern-dist` so they can be shared without publishing to a registry.
 *
 * With `mode: "host"`, packaging requires the corresponding language toolchain (npm, pip, gradle,
 * dotnet, gem, composer, cargo) to be installed on the machine. With `mode: "docker"`, each
 * toolchain command runs inside an official Docker image with the output directory mounted, so no
 * local toolchains are needed (only a container runtime).
 */
export async function packLocalOutputForGroup({
    group,
    context,
    mode = "host",
    runner,
    packOnly = false
}: {
    group: generatorsYml.GeneratorGroup;
    context: TaskContext;
    mode?: PackMode;
    runner?: ContainerRunner;
    /** Keep only the fern-dist/ artifact in each output directory, removing the generated SDK source. */
    packOnly?: boolean;
}): Promise<void> {
    const failures: string[] = [];
    for (const generator of group.generators) {
        const outputPath = generator.absolutePathToLocalOutput;
        if (outputPath == null) {
            context.logger.debug(
                `Skipping packaging for ${generator.name}: output is not written to the local file system.`
            );
            continue;
        }
        const language = generator.language;
        if (language == null) {
            context.logger.warn(`Skipping packaging for ${generator.name}: could not determine language.`);
            continue;
        }
        try {
            await packOutputForLanguage({ language, outputPath, context, mode, runner: runner ?? "docker" });
            if (packOnly) {
                await removeEverythingExceptDist({ outputPath, context });
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            context.logger.error(`Failed to package ${generator.name} output at ${outputPath}: ${message}`);
            await removeDistDirIfEmpty(outputPath);
            failures.push(generator.name);
        }
    }
    if (failures.length > 0) {
        context.failAndThrow(`Packaging failed for: ${failures.join(", ")}`);
    }
}

async function packOutputForLanguage({
    language,
    outputPath,
    context,
    mode,
    runner
}: {
    language: generatorsYml.GenerationLanguage;
    outputPath: AbsoluteFilePath;
    context: TaskContext;
    mode: PackMode;
    runner: ContainerRunner;
}): Promise<void> {
    const distDir = join(outputPath, RelativeFilePath.of(PACK_OUTPUT_DIRECTORY));
    const run = async (commands: string[][]) => {
        await runPackCommands({ commands, language, outputPath, context, mode, runner });
    };
    switch (language) {
        case "typescript": {
            await mkdir(distDir, { recursive: true });
            const commands: string[][] = [["npm", "install"]];
            if (await hasNpmScript({ outputPath, script: "build" })) {
                commands.push(["npm", "run", "build"]);
            }
            commands.push(["npm", "pack", "--pack-destination", PACK_OUTPUT_DIRECTORY]);
            await run(commands);
            logArtifacts({ distDir, context });
            return;
        }
        case "python": {
            await mkdir(distDir, { recursive: true });
            await run([["python3", "-m", "pip", "wheel", ".", "--no-deps", "--wheel-dir", PACK_OUTPUT_DIRECTORY]]);
            logArtifacts({ distDir, context });
            return;
        }
        case "java": {
            await mkdir(distDir, { recursive: true });
            await run([["gradle", "jar", "-x", "test"]]);
            const libsDir = join(outputPath, RelativeFilePath.of("build/libs"));
            await copyMatchingFiles({ fromDir: libsDir, toDir: distDir, extension: ".jar" });
            logArtifacts({ distDir, context });
            return;
        }
        case "csharp": {
            await mkdir(distDir, { recursive: true });
            const csproj = await findCsproj(outputPath);
            if (csproj == null) {
                throw new Error("No packable .csproj found in output directory.");
            }
            await run([["dotnet", "pack", csproj, "-c", "Release", "-o", PACK_OUTPUT_DIRECTORY]]);
            logArtifacts({ distDir, context });
            return;
        }
        case "ruby": {
            await mkdir(distDir, { recursive: true });
            const gemspec = (await readdir(outputPath)).find((file) => file.endsWith(".gemspec"));
            if (gemspec == null) {
                throw new Error("No .gemspec found in output directory.");
            }
            await run([["gem", "build", gemspec]]);
            await moveMatchingFiles({ fromDir: outputPath, toDir: distDir, extension: ".gem" });
            logArtifacts({ distDir, context });
            return;
        }
        case "php": {
            await mkdir(distDir, { recursive: true });
            await run([["composer", "archive", "--format=zip", `--dir=${PACK_OUTPUT_DIRECTORY}`]]);
            logArtifacts({ distDir, context });
            return;
        }
        case "rust": {
            await mkdir(distDir, { recursive: true });
            await run([["cargo", "package", "--allow-dirty", "--no-verify"]]);
            const packageDir = join(outputPath, RelativeFilePath.of("target/package"));
            await copyMatchingFiles({ fromDir: packageDir, toDir: distDir, extension: ".crate" });
            logArtifacts({ distDir, context });
            return;
        }
        case "go": {
            // Go modules have no binary package format ('go get' always fetches source), so the
            // shareable artifact is a zip of the module source. Consumers unzip it and reference
            // it with a 'replace' directive in go.mod.
            await mkdir(distDir, { recursive: true });
            const zipName = `${basename(outputPath)}-source.zip`;
            await zipDirectory({
                sourceDir: outputPath,
                zipPath: join(distDir, RelativeFilePath.of(zipName))
            });
            logArtifacts({ distDir, context });
            return;
        }
        case "swift":
            context.logger.warn(
                "Swift SDKs are distributed as source packages (Swift Package Manager), so there is no package artifact to build. " +
                    "Share the output directory itself, or reference it as a local package dependency."
            );
            return;
        default:
            assertNever(language);
    }
}

/**
 * Runs the toolchain commands for a language, either directly on the host (cwd = output dir) or
 * inside the language's official Docker image with the output directory mounted at /workspace.
 * Commands only use paths relative to the output directory, so they work identically in both modes.
 */
async function runPackCommands({
    commands,
    language,
    outputPath,
    context,
    mode,
    runner
}: {
    commands: string[][];
    language: generatorsYml.GenerationLanguage;
    outputPath: AbsoluteFilePath;
    context: TaskContext;
    mode: PackMode;
    runner: ContainerRunner;
}): Promise<void> {
    for (const command of commands) {
        const [executable, ...args] = command;
        if (executable == null) {
            continue;
        }
        if (mode === "host") {
            // Hide any enclosing git repository from the packaging toolchain. Output directories
            // commonly live inside (and are gitignored by) a fern config repo, and VCS-aware
            // build backends (e.g. poetry-core) exclude gitignored files — silently producing
            // empty artifacts. Docker mode is immune because only the output dir is mounted.
            await loggingExeca(context.logger, executable, args, {
                cwd: outputPath,
                env: { ...process.env, GIT_DIR: join(outputPath, RelativeFilePath.of(".git")) }
            });
            continue;
        }
        const image = PACK_DOCKER_IMAGES[language];
        if (image == null) {
            throw new Error(`No Docker toolchain image is configured for ${language}.`);
        }
        const containerArgs = ["run", "--rm", "-v", `${outputPath}:/workspace`, "-w", "/workspace", "-e", "HOME=/tmp"];
        // Run as the invoking user on POSIX hosts so artifacts in the mounted volume aren't root-owned.
        if (process.getuid != null && process.getgid != null) {
            containerArgs.push("--user", `${process.getuid()}:${process.getgid()}`);
        }
        await loggingExeca(context.logger, runner, [...containerArgs, image, executable, ...args], {
            cwd: outputPath
        });
    }
}

/**
 * Zips the contents of a directory (excluding fern-dist itself and any .git directory) into
 * `zipPath`. Runs in-process, so it behaves identically in host and docker pack modes and
 * requires no language toolchain.
 */
async function zipDirectory({
    sourceDir,
    zipPath
}: {
    sourceDir: AbsoluteFilePath;
    zipPath: AbsoluteFilePath;
}): Promise<void> {
    const zip = new ZipFile();
    const addEntries = async (dir: AbsoluteFilePath, prefix: string): Promise<void> => {
        for (const entry of await readdir(dir, { withFileTypes: true })) {
            if (prefix === "" && (entry.name === PACK_OUTPUT_DIRECTORY || entry.name === ".git")) {
                continue;
            }
            const entryPath = join(dir, RelativeFilePath.of(entry.name));
            const entryName = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
            if (entry.isDirectory()) {
                await addEntries(entryPath, entryName);
            } else if (entry.isFile()) {
                zip.addFile(entryPath, entryName);
            }
        }
    };
    await addEntries(sourceDir, "");
    zip.end();
    await new Promise<void>((resolve, reject) => {
        zip.outputStream.on("error", reject);
        zip.outputStream.pipe(createWriteStream(zipPath)).on("close", resolve).on("error", reject);
    });
}

/**
 * Removes every entry in the output directory except the fern-dist/ artifact folder, so only the
 * distributable package remains (used by --package-only).
 */
async function removeEverythingExceptDist({
    outputPath,
    context
}: {
    outputPath: AbsoluteFilePath;
    context: TaskContext;
}): Promise<void> {
    for (const entry of await readdir(outputPath)) {
        if (entry === PACK_OUTPUT_DIRECTORY) {
            continue;
        }
        await rm(join(outputPath, RelativeFilePath.of(entry)), { recursive: true, force: true });
    }
    context.logger.info(`Removed generated SDK source from ${outputPath}; only ${PACK_OUTPUT_DIRECTORY}/ remains.`);
}

async function removeDistDirIfEmpty(outputPath: AbsoluteFilePath): Promise<void> {
    const distDir = join(outputPath, RelativeFilePath.of(PACK_OUTPUT_DIRECTORY));
    try {
        if ((await readdir(distDir)).length === 0) {
            await rmdir(distDir);
        }
    } catch {
        // dist dir was never created (or was removed concurrently) — nothing to clean up
    }
}

async function hasNpmScript({
    outputPath,
    script
}: {
    outputPath: AbsoluteFilePath;
    script: string;
}): Promise<boolean> {
    const packageJsonPath = join(outputPath, RelativeFilePath.of("package.json"));
    if (!(await doesPathExist(packageJsonPath))) {
        return false;
    }
    const parsed: unknown = JSON.parse(await readFile(packageJsonPath, "utf-8"));
    if (typeof parsed !== "object" || parsed == null || !("scripts" in parsed)) {
        return false;
    }
    const scripts = (parsed as { scripts: unknown }).scripts;
    return typeof scripts === "object" && scripts != null && script in scripts;
}

/** Returns the path of the packable (non-test) csproj, relative to the output directory. */
async function findCsproj(outputPath: AbsoluteFilePath): Promise<string | undefined> {
    const srcDir = join(outputPath, RelativeFilePath.of("src"));
    if (!(await doesPathExist(srcDir))) {
        return undefined;
    }
    for (const entry of await readdir(srcDir, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name.endsWith(".Test") || entry.name.endsWith(".Tests")) {
            continue;
        }
        const relativeCsprojPath = `src/${entry.name}/${entry.name}.csproj`;
        if (await doesPathExist(join(outputPath, RelativeFilePath.of(relativeCsprojPath)))) {
            return relativeCsprojPath;
        }
    }
    return undefined;
}

async function copyMatchingFiles({
    fromDir,
    toDir,
    extension
}: {
    fromDir: AbsoluteFilePath;
    toDir: AbsoluteFilePath;
    extension: string;
}): Promise<void> {
    if (!(await doesPathExist(fromDir))) {
        throw new Error(`Expected build output directory ${fromDir} does not exist.`);
    }
    for (const file of await readdir(fromDir)) {
        if (file.endsWith(extension)) {
            await copyFile(join(fromDir, RelativeFilePath.of(file)), join(toDir, RelativeFilePath.of(file)));
        }
    }
}

async function moveMatchingFiles({
    fromDir,
    toDir,
    extension
}: {
    fromDir: AbsoluteFilePath;
    toDir: AbsoluteFilePath;
    extension: string;
}): Promise<void> {
    for (const file of await readdir(fromDir)) {
        if (file.endsWith(extension)) {
            await rename(join(fromDir, RelativeFilePath.of(file)), join(toDir, RelativeFilePath.of(file)));
        }
    }
}

function logArtifacts({ distDir, context }: { distDir: AbsoluteFilePath; context: TaskContext }): void {
    context.logger.info(`Packaged artifacts written to ${distDir}`);
}
