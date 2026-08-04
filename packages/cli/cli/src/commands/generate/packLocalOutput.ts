import { FERNIGNORE_FILENAME, generatorsYml, getFernIgnorePaths } from "@fern-api/configuration-loader";
import { assertNever, ContainerRunner } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { createWriteStream } from "fs";
import { copyFile, mkdir, readdir, readFile, rename, rm, rmdir, writeFile } from "fs/promises";
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
    packOnly = false,
    version
}: {
    group: generatorsYml.GeneratorGroup;
    context: TaskContext;
    mode?: PackMode;
    runner?: ContainerRunner;
    /** Keep only the fern-dist/ artifact in each output directory, removing the generated SDK source. */
    packOnly?: boolean;
    /** The version the SDKs were generated with (from --version), used in package metadata. */
    version?: string;
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
            const artifactProduced = await packOutputForLanguage({
                language,
                outputPath,
                context,
                mode,
                runner: runner ?? "docker",
                version
            });
            if (packOnly) {
                if (artifactProduced) {
                    await removeEverythingExceptDist({ outputPath, context });
                } else {
                    context.logger.warn(
                        `Keeping generated source for ${generator.name}: no package artifact was produced, so there is nothing to keep in ${PACK_OUTPUT_DIRECTORY}/.`
                    );
                }
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

/** Packs one generator's output. Returns whether a package artifact was produced in fern-dist/. */
async function packOutputForLanguage({
    language,
    outputPath,
    context,
    mode,
    runner,
    version
}: {
    language: generatorsYml.GenerationLanguage;
    outputPath: AbsoluteFilePath;
    context: TaskContext;
    mode: PackMode;
    runner: ContainerRunner;
    version: string | undefined;
}): Promise<boolean> {
    const distDir = join(outputPath, RelativeFilePath.of(PACK_OUTPUT_DIRECTORY));
    const run = async (commands: string[][]) => {
        await runPackCommands({ commands, language, outputPath, context, mode, runner });
    };
    switch (language) {
        case "typescript": {
            await mkdir(distDir, { recursive: true });
            await run([["npm", "install"]]);
            // Compile the package before packing so the tarball ships runnable JavaScript and
            // consumers can require() it right after npm install, without a post-install build.
            if (await hasNpmScript({ outputPath, script: "build" })) {
                // Generated build scripts invoke pnpm, which isn't preinstalled on the host or in
                // the node toolchain image — npx fetches it on demand and puts it on PATH for the
                // nested `pnpm build:*` invocations.
                await run([["npx", "--yes", "pnpm", "run", "build"]]);
            } else {
                const tsconfig = await findTsconfig(outputPath);
                if (tsconfig != null) {
                    try {
                        await run([["npx", "--yes", "--package", "typescript", "tsc", "--project", tsconfig]]);
                    } catch (error) {
                        // tsc emits output even when type errors are reported (noEmitOnError is off
                        // by default); pack whatever was produced rather than failing the build. If
                        // nothing was emitted at all, the failure was real (e.g. npx couldn't fetch
                        // typescript), so don't ship a tarball with no compiled code.
                        if (!(await hasEmittedCompilerOutput({ outputPath, tsconfig }))) {
                            throw error;
                        }
                        context.logger.warn(
                            `tsc reported errors while compiling ${tsconfig}; packing the emitted output anyway.`
                        );
                    }
                }
            }
            // Without a "files" field, npm pack falls back to .gitignore, which typically lists
            // dist/ — silently dropping the compiled output from the tarball. An .npmignore takes
            // precedence over .gitignore, so drop a temporary one that only excludes fern-dist.
            const npmignorePath = join(outputPath, RelativeFilePath.of(".npmignore"));
            const shouldWriteNpmignore =
                !(await doesPathExist(npmignorePath)) &&
                !(await hasPackageJsonFilesField(outputPath)) &&
                (await doesPathExist(join(outputPath, RelativeFilePath.of(".gitignore"))));
            if (shouldWriteNpmignore) {
                await writeFile(npmignorePath, `${PACK_OUTPUT_DIRECTORY}/\n`);
            }
            try {
                await run([["npm", "pack", "--pack-destination", PACK_OUTPUT_DIRECTORY]]);
            } finally {
                if (shouldWriteNpmignore) {
                    await rm(npmignorePath, { force: true });
                }
            }
            logArtifacts({ distDir, context });
            return true;
        }
        case "python": {
            await mkdir(distDir, { recursive: true });
            const pipWheelCommand = [
                "python3",
                "-m",
                "pip",
                "wheel",
                ".",
                "--no-deps",
                "--wheel-dir",
                PACK_OUTPUT_DIRECTORY
            ];
            if (mode === "host") {
                try {
                    await run([pipWheelCommand]);
                } catch {
                    // Host pythons frequently can't run `pip wheel` directly (no pip module, old
                    // interpreter, missing build tooling). Retry inside a throwaway venv with the
                    // PyPA `build` frontend, which performs an isolated, PEP 517 build.
                    context.logger.warn(
                        "pip wheel failed on the host toolchain; retrying in an isolated build environment (python -m venv + python -m build)."
                    );
                    const venvDirectory = ".fern-pack-venv";
                    const venvPython =
                        process.platform === "win32"
                            ? `${venvDirectory}/Scripts/python`
                            : `${venvDirectory}/bin/python`;
                    try {
                        await run([
                            ["python3", "-m", "venv", venvDirectory],
                            [venvPython, "-m", "pip", "install", "--quiet", "build"],
                            [venvPython, "-m", "build", "--wheel", "--outdir", PACK_OUTPUT_DIRECTORY]
                        ]);
                    } finally {
                        await rm(join(outputPath, RelativeFilePath.of(venvDirectory)), {
                            recursive: true,
                            force: true
                        });
                    }
                }
            } else {
                await run([pipWheelCommand]);
            }
            logArtifacts({ distDir, context });
            return true;
        }
        case "java": {
            await mkdir(distDir, { recursive: true });
            // A bare JAR carries no dependency metadata, so consumers would have to declare every
            // transitive dependency by hand. Generate a POM alongside it via an init script that
            // registers a maven-publish publication (local outputs have no publishing config).
            const initScriptName = ".fern-pack-pom-init.gradle";
            const initScriptPath = join(outputPath, RelativeFilePath.of(initScriptName));
            await writeFile(initScriptPath, getJavaPomInitScript({ fallbackVersion: version ?? "0.0.0" }));
            try {
                await run([
                    [
                        "gradle",
                        "--init-script",
                        initScriptName,
                        "jar",
                        `generatePomFileFor${JAVA_POM_PUBLICATION_NAME_CAPITALIZED}Publication`,
                        "-x",
                        "test"
                    ]
                ]);
            } finally {
                await rm(initScriptPath, { force: true });
            }
            const libsDir = join(outputPath, RelativeFilePath.of("build/libs"));
            await copyMatchingFiles({ fromDir: libsDir, toDir: distDir, extension: ".jar" });
            await copyGeneratedPom({ outputPath, distDir, context });
            logArtifacts({ distDir, context });
            return true;
        }
        case "csharp": {
            await mkdir(distDir, { recursive: true });
            const csproj = await findCsproj(outputPath);
            if (csproj == null) {
                throw new Error("No packable .csproj found in output directory.");
            }
            await run([["dotnet", "pack", csproj, "-c", "Release", "-o", PACK_OUTPUT_DIRECTORY]]);
            logArtifacts({ distDir, context });
            return true;
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
            return true;
        }
        case "php": {
            await mkdir(distDir, { recursive: true });
            await run([["composer", "archive", "--format=zip", `--dir=${PACK_OUTPUT_DIRECTORY}`]]);
            logArtifacts({ distDir, context });
            return true;
        }
        case "rust": {
            await mkdir(distDir, { recursive: true });
            await run([["cargo", "package", "--allow-dirty", "--no-verify"]]);
            const packageDir = join(outputPath, RelativeFilePath.of("target/package"));
            await copyMatchingFiles({ fromDir: packageDir, toDir: distDir, extension: ".crate" });
            logArtifacts({ distDir, context });
            return true;
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
            return true;
        }
        case "swift":
            context.logger.warn(
                "Swift SDKs are distributed as source packages (Swift Package Manager), so there is no package artifact to build. " +
                    "Share the output directory itself, or reference it as a local package dependency."
            );
            return false;
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
        // Mount under a directory that keeps the output folder's name so toolchains that derive
        // package identity from the directory name (e.g. Gradle's project name) behave the same
        // as on the host.
        const workdir = `/workspace/${basename(outputPath)}`;
        const containerArgs = ["run", "--rm", "-v", `${outputPath}:${workdir}`, "-w", workdir, "-e", "HOME=/tmp"];
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
 * Removes the generated SDK source from the output directory so only the fern-dist/ artifact
 * remains (used by --package-only). Never removes:
 * - fern-dist/ (the artifact itself),
 * - .git (output directories are often checked-in repos),
 * - .fernignore and any top-level path covered by a .fernignore entry (hand-written files that
 *   local generation intentionally preserves). Nested/glob entries are handled conservatively by
 *   preserving their entire top-level directory.
 */
async function removeEverythingExceptDist({
    outputPath,
    context
}: {
    outputPath: AbsoluteFilePath;
    context: TaskContext;
}): Promise<void> {
    const preserved = new Set<string>([PACK_OUTPUT_DIRECTORY, ".git"]);
    const fernignorePath = join(outputPath, RelativeFilePath.of(FERNIGNORE_FILENAME));
    if (await doesPathExist(fernignorePath)) {
        for (const ignorePath of await getFernIgnorePaths({ absolutePathToFernignore: fernignorePath })) {
            const topLevelSegment = ignorePath.split("/")[0];
            if (topLevelSegment != null && topLevelSegment.length > 0) {
                preserved.add(topLevelSegment);
            }
        }
    }
    for (const entry of await readdir(outputPath)) {
        if (preserved.has(entry)) {
            continue;
        }
        await rm(join(outputPath, RelativeFilePath.of(entry)), { recursive: true, force: true });
    }
    context.logger.info(`Removed generated SDK source from ${outputPath}; kept ${[...preserved].join(", ")}.`);
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

const JAVA_POM_PUBLICATION_NAME = "fernLocalPack";
const JAVA_POM_PUBLICATION_NAME_CAPITALIZED = "FernLocalPack";

/**
 * Gradle init script that registers a maven-publish publication on every java project so
 * `generatePomFileFor...Publication` can emit a POM with the project's dependencies, even when
 * the generated build.gradle has no publishing configuration (the local-file-system case).
 */
function getJavaPomInitScript({ fallbackVersion }: { fallbackVersion: string }): string {
    return `allprojects { project ->
    project.plugins.withId("java") {
        project.apply plugin: "maven-publish"
        project.afterEvaluate {
            if (project.group == null || project.group.toString().isEmpty()) {
                project.group = project.name
            }
            if (project.version == null || project.version.toString() == "unspecified") {
                project.version = "${fallbackVersion}"
            }
            if (project.publishing.publications.findByName("${JAVA_POM_PUBLICATION_NAME}") == null) {
                project.publishing.publications.create("${JAVA_POM_PUBLICATION_NAME}", MavenPublication) {
                    from project.components.java
                }
            }
        }
    }
}
`;
}

/** Copies the POM emitted by the init-script publication into fern-dist, named after the jar. */
async function copyGeneratedPom({
    outputPath,
    distDir,
    context
}: {
    outputPath: AbsoluteFilePath;
    distDir: AbsoluteFilePath;
    context: TaskContext;
}): Promise<void> {
    const pomPath = join(
        outputPath,
        RelativeFilePath.of(`build/publications/${JAVA_POM_PUBLICATION_NAME}/pom-default.xml`)
    );
    if (!(await doesPathExist(pomPath))) {
        context.logger.warn(
            "No POM was generated for the Java package; the JAR is packaged without dependency metadata."
        );
        return;
    }
    const jarNames = (await readdir(distDir)).filter((file) => file.endsWith(".jar"));
    const jarName =
        jarNames.find((file) => !file.endsWith("-sources.jar") && !file.endsWith("-javadoc.jar")) ?? jarNames[0];
    const pomName = jarName != null ? `${jarName.slice(0, -".jar".length)}.pom` : "pom.xml";
    await copyFile(pomPath, join(distDir, RelativeFilePath.of(pomName)));
}

/** Whether the tsconfig's outDir (or ./dist by default) exists and is non-empty. */
async function hasEmittedCompilerOutput({
    outputPath,
    tsconfig
}: {
    outputPath: AbsoluteFilePath;
    tsconfig: string;
}): Promise<boolean> {
    let outDir = "dist";
    try {
        const parsed: unknown = JSON.parse(await readFile(join(outputPath, RelativeFilePath.of(tsconfig)), "utf-8"));
        if (typeof parsed === "object" && parsed != null && "compilerOptions" in parsed) {
            const compilerOptions = (parsed as { compilerOptions: unknown }).compilerOptions;
            if (
                typeof compilerOptions === "object" &&
                compilerOptions != null &&
                "outDir" in compilerOptions &&
                typeof (compilerOptions as { outDir: unknown }).outDir === "string"
            ) {
                outDir = (compilerOptions as { outDir: string }).outDir;
            }
        }
    } catch {
        // tsconfig files may contain comments or be otherwise unparseable as plain JSON;
        // fall back to the conventional ./dist output directory.
    }
    const outDirPath = join(outputPath, RelativeFilePath.of(outDir));
    if (!(await doesPathExist(outDirPath))) {
        return false;
    }
    return (await readdir(outDirPath)).length > 0;
}

/** Returns the tsconfig to compile with when the package has no build script, if one exists. */
async function findTsconfig(outputPath: AbsoluteFilePath): Promise<string | undefined> {
    for (const candidate of ["tsconfig.cjs.json", "tsconfig.json"]) {
        if (await doesPathExist(join(outputPath, RelativeFilePath.of(candidate)))) {
            return candidate;
        }
    }
    return undefined;
}

async function hasPackageJsonFilesField(outputPath: AbsoluteFilePath): Promise<boolean> {
    const packageJsonPath = join(outputPath, RelativeFilePath.of("package.json"));
    if (!(await doesPathExist(packageJsonPath))) {
        return false;
    }
    const parsed: unknown = JSON.parse(await readFile(packageJsonPath, "utf-8"));
    return typeof parsed === "object" && parsed != null && "files" in parsed;
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
