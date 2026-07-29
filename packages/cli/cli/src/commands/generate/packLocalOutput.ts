import { generatorsYml } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { copyFile, mkdir, readdir, readFile, rename } from "fs/promises";

/** Directory (inside each generator's local output) where packaged artifacts are written. */
export const PACK_OUTPUT_DIRECTORY = "fern-dist";

/**
 * Builds distributable package artifacts (e.g. an npm tarball, Python wheel, JAR, NuGet package,
 * or gem) for every generator in the group that wrote its output to the local file system.
 * Artifacts land in `<output>/fern-dist` so they can be shared without publishing to a registry.
 *
 * Packaging requires the corresponding language toolchain (npm, pip, gradle, dotnet, gem,
 * composer, cargo) to be installed on the machine.
 */
export async function packLocalOutputForGroup({
    group,
    context
}: {
    group: generatorsYml.GeneratorGroup;
    context: TaskContext;
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
            await packOutputForLanguage({ language, outputPath, context });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            context.logger.error(`Failed to package ${generator.name} output at ${outputPath}: ${message}`);
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
    context
}: {
    language: generatorsYml.GenerationLanguage;
    outputPath: AbsoluteFilePath;
    context: TaskContext;
}): Promise<void> {
    const distDir = join(outputPath, RelativeFilePath.of(PACK_OUTPUT_DIRECTORY));
    switch (language) {
        case "typescript": {
            await mkdir(distDir, { recursive: true });
            await loggingExeca(context.logger, "npm", ["install"], { cwd: outputPath });
            if (await hasNpmScript({ outputPath, script: "build" })) {
                await loggingExeca(context.logger, "npm", ["run", "build"], { cwd: outputPath });
            }
            await loggingExeca(context.logger, "npm", ["pack", "--pack-destination", distDir], { cwd: outputPath });
            logArtifacts({ distDir, context });
            return;
        }
        case "python": {
            await mkdir(distDir, { recursive: true });
            await loggingExeca(
                context.logger,
                "python3",
                ["-m", "pip", "wheel", ".", "--no-deps", "--wheel-dir", distDir],
                { cwd: outputPath }
            );
            logArtifacts({ distDir, context });
            return;
        }
        case "java": {
            await mkdir(distDir, { recursive: true });
            await loggingExeca(context.logger, "gradle", ["jar", "-x", "test"], { cwd: outputPath });
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
            await loggingExeca(context.logger, "dotnet", ["pack", csproj, "-c", "Release", "-o", distDir], {
                cwd: outputPath
            });
            logArtifacts({ distDir, context });
            return;
        }
        case "ruby": {
            await mkdir(distDir, { recursive: true });
            const gemspec = (await readdir(outputPath)).find((file) => file.endsWith(".gemspec"));
            if (gemspec == null) {
                throw new Error("No .gemspec found in output directory.");
            }
            await loggingExeca(context.logger, "gem", ["build", gemspec], { cwd: outputPath });
            await moveMatchingFiles({ fromDir: outputPath, toDir: distDir, extension: ".gem" });
            logArtifacts({ distDir, context });
            return;
        }
        case "php": {
            await mkdir(distDir, { recursive: true });
            await loggingExeca(
                context.logger,
                "composer",
                ["archive", "--format=zip", `--dir=${PACK_OUTPUT_DIRECTORY}`],
                { cwd: outputPath }
            );
            logArtifacts({ distDir, context });
            return;
        }
        case "rust": {
            await mkdir(distDir, { recursive: true });
            await loggingExeca(context.logger, "cargo", ["package", "--allow-dirty", "--no-verify"], {
                cwd: outputPath
            });
            const packageDir = join(outputPath, RelativeFilePath.of("target/package"));
            await copyMatchingFiles({ fromDir: packageDir, toDir: distDir, extension: ".crate" });
            logArtifacts({ distDir, context });
            return;
        }
        case "go":
            context.logger.warn(
                "Go SDKs are distributed as source modules, so there is no package artifact to build. " +
                    "Share the output directory itself (e.g. as a zip), or reference it with a 'replace' directive in go.mod."
            );
            return;
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

async function findCsproj(outputPath: AbsoluteFilePath): Promise<string | undefined> {
    const srcDir = join(outputPath, RelativeFilePath.of("src"));
    if (!(await doesPathExist(srcDir))) {
        return undefined;
    }
    for (const entry of await readdir(srcDir, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name.endsWith(".Test") || entry.name.endsWith(".Tests")) {
            continue;
        }
        const csprojPath = join(srcDir, RelativeFilePath.of(entry.name), RelativeFilePath.of(`${entry.name}.csproj`));
        if (await doesPathExist(csprojPath)) {
            return csprojPath;
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
