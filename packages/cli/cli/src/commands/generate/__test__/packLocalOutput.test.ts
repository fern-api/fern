import { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { mkdir, mkdtemp, readdir, readFile, stat, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { packLocalOutputForGroup } from "../packLocalOutput.js";

vi.mock("@fern-api/logging-execa", () => ({
    loggingExeca: vi.fn(async () => ({ stdout: "", stderr: "" }))
}));

const { loggingExeca } = await import("@fern-api/logging-execa");
const loggingExecaMock = vi.mocked(loggingExeca);

function createGenerator({
    name,
    language,
    outputPath
}: {
    name: string;
    language: generatorsYml.GenerationLanguage | undefined;
    outputPath: AbsoluteFilePath | undefined;
}): generatorsYml.GeneratorInvocation {
    return {
        name,
        language,
        absolutePathToLocalOutput: outputPath
    } as unknown as generatorsYml.GeneratorInvocation;
}

async function writeJavaBuildOutput(outputDir: AbsoluteFilePath): Promise<void> {
    await mkdir(path.join(outputDir, "build", "libs"), { recursive: true });
    await writeFile(path.join(outputDir, "build", "libs", "acme-sdk.jar"), "jar-bytes");
    await mkdir(path.join(outputDir, "build", "publications", "fernLocalPack"), { recursive: true });
    await writeFile(path.join(outputDir, "build", "publications", "fernLocalPack", "pom-default.xml"), "<project />");
}

describe("packLocalOutputForGroup", () => {
    let outputDir: AbsoluteFilePath;

    beforeEach(async () => {
        loggingExecaMock.mockClear();
        outputDir = AbsoluteFilePath.of(await mkdtemp(path.join(tmpdir(), "fern-pack-test-")));
    });

    it("fails loudly when no generator in the group writes to the local file system", async () => {
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [
                createGenerator({ name: "fernapi/fern-python-sdk", language: "python", outputPath: undefined })
            ]
        } as unknown as generatorsYml.GeneratorGroup;

        const context = createMockTaskContext();
        const failAndThrow = vi.spyOn(context, "failAndThrow");
        await expect(packLocalOutputForGroup({ group, context, packOnly: true })).rejects.toThrow();
        expect(failAndThrow).toHaveBeenCalledWith(
            expect.stringMatching(/Nothing to package in group 'test'.*--package-only.*fernapi\/fern-python-sdk/)
        );
        expect(loggingExecaMock).not.toHaveBeenCalled();
    });

    it("skips generators without local-file-system output when another generator is packagable", async () => {
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [
                createGenerator({ name: "fernapi/fern-python-sdk", language: "python", outputPath: undefined }),
                createGenerator({ name: "fernapi/fern-go-sdk", language: "go", outputPath: outputDir })
            ]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext() });
        expect(loggingExecaMock).not.toHaveBeenCalled();
        expect(await readdir(path.join(outputDir, "fern-dist"))).toEqual([`${path.basename(outputDir)}-source.zip`]);
    });

    it("runs pip wheel for python generators", async () => {
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [
                createGenerator({ name: "fernapi/fern-python-sdk", language: "python", outputPath: outputDir })
            ]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext() });

        expect(loggingExecaMock).toHaveBeenCalledTimes(1);
        const [, command, args, options] = loggingExecaMock.mock.calls[0] ?? [];
        expect(command).toBe("python3");
        expect(args).toContain("wheel");
        // Host-mode packaging must hide any enclosing git repo, otherwise VCS-aware build
        // backends (e.g. poetry-core) exclude gitignored output files and produce empty artifacts.
        expect(options?.env?.GIT_DIR).toBe(path.join(outputDir, ".git"));
    });

    it("runs npm install and npm pack for typescript generators, including build when a build script exists", async () => {
        await writeFile(path.join(outputDir, "package.json"), JSON.stringify({ scripts: { build: "tsc" } }));
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [
                createGenerator({
                    name: "fernapi/fern-typescript-node-sdk",
                    language: "typescript",
                    outputPath: outputDir
                })
            ]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext() });

        const commands = loggingExecaMock.mock.calls.map(([, command, args]) => [command, ...(args ?? [])].join(" "));
        expect(commands[0]).toBe("npm install");
        expect(commands[1]).toBe("npx --yes pnpm run build");
        expect(commands[2]).toContain("npm pack");
    });

    it("compiles with tsc before packing when a typescript package has no build script", async () => {
        await writeFile(path.join(outputDir, "package.json"), JSON.stringify({ name: "acme" }));
        await writeFile(path.join(outputDir, "tsconfig.cjs.json"), "{}");
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [
                createGenerator({
                    name: "fernapi/fern-typescript-node-sdk",
                    language: "typescript",
                    outputPath: outputDir
                })
            ]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext() });

        const commands = loggingExecaMock.mock.calls.map(([, command, args]) => [command, ...(args ?? [])].join(" "));
        expect(commands[0]).toBe("npm install");
        expect(commands[1]).toBe("npx --yes --package typescript tsc --project tsconfig.cjs.json");
        expect(commands[2]).toContain("npm pack");
    });

    it("fails typescript packaging when tsc fails and no output was emitted", async () => {
        await writeFile(path.join(outputDir, "package.json"), JSON.stringify({ name: "acme" }));
        await writeFile(path.join(outputDir, "tsconfig.json"), "{}");
        loggingExecaMock
            .mockResolvedValueOnce({ stdout: "", stderr: "" } as never)
            .mockRejectedValueOnce(new Error("npx could not fetch typescript"));
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [
                createGenerator({
                    name: "fernapi/fern-typescript-node-sdk",
                    language: "typescript",
                    outputPath: outputDir
                })
            ]
        } as unknown as generatorsYml.GeneratorGroup;

        await expect(packLocalOutputForGroup({ group, context: createMockTaskContext() })).rejects.toThrow();
        const commands = loggingExecaMock.mock.calls.map(([, command, args]) => [command, ...(args ?? [])].join(" "));
        expect(commands.find((command) => command.includes("npm pack"))).toBeUndefined();
    });

    it("packs the emitted output when tsc reports errors but still emitted to the outDir", async () => {
        await writeFile(path.join(outputDir, "package.json"), JSON.stringify({ name: "acme" }));
        await writeFile(
            path.join(outputDir, "tsconfig.cjs.json"),
            JSON.stringify({ compilerOptions: { outDir: "dist/cjs" } })
        );
        await mkdir(path.join(outputDir, "dist", "cjs"), { recursive: true });
        await writeFile(path.join(outputDir, "dist", "cjs", "index.js"), "module.exports = {};");
        loggingExecaMock
            .mockResolvedValueOnce({ stdout: "", stderr: "" } as never)
            .mockRejectedValueOnce(new Error("tsc exited with code 2"));
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [
                createGenerator({
                    name: "fernapi/fern-typescript-node-sdk",
                    language: "typescript",
                    outputPath: outputDir
                })
            ]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext() });

        const commands = loggingExecaMock.mock.calls.map(([, command, args]) => [command, ...(args ?? [])].join(" "));
        expect(commands.find((command) => command.includes("npm pack"))).toBeDefined();
    });

    it("falls back to an isolated venv build when host pip wheel fails for python generators", async () => {
        loggingExecaMock.mockRejectedValueOnce(new Error("No module named pip"));
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [
                createGenerator({ name: "fernapi/fern-python-sdk", language: "python", outputPath: outputDir })
            ]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext() });

        const commands = loggingExecaMock.mock.calls.map(([, command, args]) => [command, ...(args ?? [])].join(" "));
        expect(commands[0]).toContain("wheel");
        expect(commands[1]).toBe("python3 -m venv .fern-pack-venv");
        expect(commands[2]).toBe(".fern-pack-venv/bin/python -m pip install --quiet build");
        expect(commands[3]).toBe(".fern-pack-venv/bin/python -m build --wheel --outdir fern-dist");
    });

    it("generates a POM alongside the jar for java generators", async () => {
        await mkdir(path.join(outputDir, "build", "libs"), { recursive: true });
        await writeFile(path.join(outputDir, "build", "libs", "acme-sdk.jar"), "jar-bytes");
        await mkdir(path.join(outputDir, "build", "publications", "fernLocalPack"), { recursive: true });
        await writeFile(
            path.join(outputDir, "build", "publications", "fernLocalPack", "pom-default.xml"),
            "<project />"
        );
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [createGenerator({ name: "fernapi/fern-java-sdk", language: "java", outputPath: outputDir })]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext() });

        expect(loggingExecaMock).toHaveBeenCalledTimes(1);
        const [, command, args] = loggingExecaMock.mock.calls[0] ?? [];
        expect(command).toBe("gradle");
        expect(args).toContain("--init-script");
        expect(args).toContain("generatePomFileForFernLocalPackPublication");
        const distFiles = (await readdir(path.join(outputDir, "fern-dist"))).sort();
        expect(distFiles).toEqual(["acme-sdk.jar", "acme-sdk.pom"]);
        // the init script is temporary and must not linger in the output directory
        expect(await readdir(outputDir)).not.toContain(".fern-pack-pom-init.gradle");
    });

    it("prefers the generated gradle wrapper over a global gradle in host mode", async () => {
        await writeJavaBuildOutput(outputDir);
        await writeFile(path.join(outputDir, "gradlew"), "#!/bin/sh\n");
        await mkdir(path.join(outputDir, "gradle", "wrapper"), { recursive: true });
        await writeFile(path.join(outputDir, "gradle", "wrapper", "gradle-wrapper.jar"), "jar-bytes");
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [createGenerator({ name: "fernapi/fern-java-sdk", language: "java", outputPath: outputDir })]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext() });

        const [, command, args] = loggingExecaMock.mock.calls[0] ?? [];
        expect([command, args?.[0], args?.[1]]).toEqual(["sh", "gradlew", "--init-script"]);
        expect(args).toContain("jar");
    });

    it("puts a Maven Central mirror ahead of gradle repositories and derives proxy settings in the java init script", async () => {
        await writeJavaBuildOutput(outputDir);
        let initScript: string | undefined;
        loggingExecaMock.mockImplementationOnce(async () => {
            initScript = await readFile(path.join(outputDir, ".fern-pack-pom-init.gradle"), "utf8");
            return { stdout: "", stderr: "" } as never;
        });
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [createGenerator({ name: "fernapi/fern-java-sdk", language: "java", outputPath: outputDir })]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext() });

        expect(initScript).toContain(
            'def fernMirrorUrl = "https://maven-central.storage-download.googleapis.com/maven2/"'
        );
        expect(initScript).toContain("settings.pluginManagement.repositories");
        expect(initScript).toContain("fernPrependMirror(project.repositories)");
        expect(initScript).toContain('System.getenv("HTTPS_PROXY")');
        expect(initScript).toContain("MavenPublication");
    });

    it("honors FERN_MAVEN_CENTRAL_MIRROR to override or disable the mirror", async () => {
        await writeJavaBuildOutput(outputDir);
        const scripts: string[] = [];
        loggingExecaMock.mockImplementation(async () => {
            scripts.push(await readFile(path.join(outputDir, ".fern-pack-pom-init.gradle"), "utf8"));
            return { stdout: "", stderr: "" } as never;
        });
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [createGenerator({ name: "fernapi/fern-java-sdk", language: "java", outputPath: outputDir })]
        } as unknown as generatorsYml.GeneratorGroup;

        try {
            process.env.FERN_MAVEN_CENTRAL_MIRROR = "https://artifactory.example.com/maven-remote/";
            await packLocalOutputForGroup({ group, context: createMockTaskContext() });
            process.env.FERN_MAVEN_CENTRAL_MIRROR = "off";
            await packLocalOutputForGroup({ group, context: createMockTaskContext() });
        } finally {
            delete process.env.FERN_MAVEN_CENTRAL_MIRROR;
            loggingExecaMock.mockReset();
            loggingExecaMock.mockImplementation(async () => ({ stdout: "", stderr: "" }) as never);
        }

        expect(scripts[0]).toContain('def fernMirrorUrl = "https://artifactory.example.com/maven-remote/"');
        expect(scripts[1]).not.toContain("fernMirrorUrl");
        expect(scripts[1]).toContain("fernApplyProxy");
    });

    it("mounts the host gradle user home and forwards proxy variables in docker mode for java", async () => {
        await writeJavaBuildOutput(outputDir);
        const gradleUserHome = await mkdtemp(path.join(tmpdir(), "fern-gradle-home-"));
        const previous = {
            GRADLE_USER_HOME: process.env.GRADLE_USER_HOME,
            HTTPS_PROXY: process.env.HTTPS_PROXY,
            NO_PROXY: process.env.NO_PROXY
        };
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [createGenerator({ name: "fernapi/fern-java-sdk", language: "java", outputPath: outputDir })]
        } as unknown as generatorsYml.GeneratorGroup;

        try {
            process.env.GRADLE_USER_HOME = gradleUserHome;
            process.env.HTTPS_PROXY = "http://proxy.example.com:8080";
            delete process.env.NO_PROXY;
            await packLocalOutputForGroup({ group, context: createMockTaskContext(), mode: "docker" });
        } finally {
            for (const [name, value] of Object.entries(previous)) {
                if (value == null) {
                    delete process.env[name];
                } else {
                    process.env[name] = value;
                }
            }
        }

        const [, command, args = []] = loggingExecaMock.mock.calls[0] ?? [];
        expect(command).toBe("docker");
        expect(args).toContain(`${gradleUserHome}:/fern-gradle-home`);
        expect(args).toContain("GRADLE_USER_HOME=/fern-gradle-home");
        expect(args.join(" ")).toContain("-e HTTPS_PROXY");
        expect(args.join(" ")).not.toContain("-e NO_PROXY");
        expect(args).toContain("gradle:8-jdk17");
        expect(args[args.indexOf("gradle:8-jdk17") + 1]).toBe("gradle");
    });

    it("names the POM after the main jar, not sources/javadoc jars", async () => {
        await mkdir(path.join(outputDir, "build", "libs"), { recursive: true });
        await writeFile(path.join(outputDir, "build", "libs", "acme-sdk-javadoc.jar"), "jar-bytes");
        await writeFile(path.join(outputDir, "build", "libs", "acme-sdk-sources.jar"), "jar-bytes");
        await writeFile(path.join(outputDir, "build", "libs", "acme-sdk.jar"), "jar-bytes");
        await mkdir(path.join(outputDir, "build", "publications", "fernLocalPack"), { recursive: true });
        await writeFile(
            path.join(outputDir, "build", "publications", "fernLocalPack", "pom-default.xml"),
            "<project />"
        );
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [createGenerator({ name: "fernapi/fern-java-sdk", language: "java", outputPath: outputDir })]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext() });

        const distFiles = (await readdir(path.join(outputDir, "fern-dist"))).sort();
        expect(distFiles).toEqual(["acme-sdk-javadoc.jar", "acme-sdk-sources.jar", "acme-sdk.jar", "acme-sdk.pom"]);
    });

    it("zips the module source for go generators without running any toolchain command", async () => {
        await writeFile(path.join(outputDir, "go.mod"), "module example.com/test\n");
        await mkdir(path.join(outputDir, "client"), { recursive: true });
        await writeFile(path.join(outputDir, "client", "client.go"), "package client\n");
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [createGenerator({ name: "fernapi/fern-go-sdk", language: "go", outputPath: outputDir })]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext() });
        expect(loggingExecaMock).not.toHaveBeenCalled();
        const distFiles = await readdir(path.join(outputDir, "fern-dist"));
        expect(distFiles).toEqual([`${path.basename(outputDir)}-source.zip`]);
        const zipStat = await stat(path.join(outputDir, "fern-dist", `${path.basename(outputDir)}-source.zip`));
        expect(zipStat.size).toBeGreaterThan(0);
    });

    it("packs the non-test csproj for csharp generators", async () => {
        const projectDir = path.join(outputDir, "src", "Acme");
        const testDir = path.join(outputDir, "src", "Acme.Test");
        await mkdir(projectDir, { recursive: true });
        await mkdir(testDir, { recursive: true });
        await writeFile(path.join(projectDir, "Acme.csproj"), "<Project />");
        await writeFile(path.join(testDir, "Acme.Test.csproj"), "<Project />");

        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [
                createGenerator({ name: "fernapi/fern-csharp-sdk", language: "csharp", outputPath: outputDir })
            ]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext() });

        expect(loggingExecaMock).toHaveBeenCalledTimes(1);
        const [, command, args] = loggingExecaMock.mock.calls[0] ?? [];
        expect(command).toBe("dotnet");
        expect(args?.[0]).toBe("pack");
        expect(args?.[1]).toContain("Acme.csproj");
        expect(args?.[1]).not.toContain("Acme.Test");
    });

    it("runs commands inside a docker toolchain image when mode is docker", async () => {
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [
                createGenerator({ name: "fernapi/fern-python-sdk", language: "python", outputPath: outputDir })
            ]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext(), mode: "docker" });

        expect(loggingExecaMock).toHaveBeenCalledTimes(1);
        const [, command, args] = loggingExecaMock.mock.calls[0] ?? [];
        expect(command).toBe("docker");
        expect(args?.[0]).toBe("run");
        expect(args).toContain("python:3.12");
        expect(args).toContain(`${outputDir}:/workspace/${path.basename(outputDir)}`);
        expect(args).toContain("wheel");
    });

    it("uses the provided container runner in docker mode", async () => {
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [
                createGenerator({ name: "fernapi/fern-python-sdk", language: "python", outputPath: outputDir })
            ]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext(), mode: "docker", runner: "podman" });

        const [, command] = loggingExecaMock.mock.calls[0] ?? [];
        expect(command).toBe("podman");
    });

    it("removes everything except fern-dist when packOnly is set", async () => {
        await writeFile(path.join(outputDir, "go.mod"), "module example.com/test\n");
        await mkdir(path.join(outputDir, "client"), { recursive: true });
        await writeFile(path.join(outputDir, "client", "client.go"), "package client\n");
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [createGenerator({ name: "fernapi/fern-go-sdk", language: "go", outputPath: outputDir })]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext(), packOnly: true });

        expect(await readdir(outputDir)).toEqual(["fern-dist"]);
        const distFiles = await readdir(path.join(outputDir, "fern-dist"));
        expect(distFiles).toEqual([`${path.basename(outputDir)}-source.zip`]);
    });

    it("preserves .git, .fernignore, and fernignore-listed paths when packOnly is set", async () => {
        await writeFile(path.join(outputDir, "go.mod"), "module example.com/test\n");
        await mkdir(path.join(outputDir, ".git"), { recursive: true });
        await writeFile(path.join(outputDir, ".git", "HEAD"), "ref: refs/heads/main\n");
        await mkdir(path.join(outputDir, "custom"), { recursive: true });
        await writeFile(path.join(outputDir, "custom", "handwritten.go"), "package custom\n");
        await writeFile(path.join(outputDir, ".fernignore"), "custom/**\n");
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [createGenerator({ name: "fernapi/fern-go-sdk", language: "go", outputPath: outputDir })]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext(), packOnly: true });

        expect((await readdir(outputDir)).sort()).toEqual([".fernignore", ".git", "custom", "fern-dist"]);
    });

    it("does not wipe the output directory when no artifact is produced (swift) and packOnly is set", async () => {
        await writeFile(path.join(outputDir, "Package.swift"), "// swift-tools-version:5.9\n");
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [createGenerator({ name: "fernapi/fern-swift-sdk", language: "swift", outputPath: outputDir })]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext(), packOnly: true });

        expect(await readdir(outputDir)).toEqual(["Package.swift"]);
    });

    it("keeps generated source alongside fern-dist when packOnly is not set", async () => {
        await writeFile(path.join(outputDir, "go.mod"), "module example.com/test\n");
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [createGenerator({ name: "fernapi/fern-go-sdk", language: "go", outputPath: outputDir })]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext() });

        expect((await readdir(outputDir)).sort()).toEqual(["fern-dist", "go.mod"]);
    });

    it("fails when packaging a generator errors", async () => {
        loggingExecaMock.mockRejectedValueOnce(new Error("python3 not found"));
        loggingExecaMock.mockRejectedValueOnce(new Error("python3 not found"));
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [
                createGenerator({ name: "fernapi/fern-python-sdk", language: "python", outputPath: outputDir })
            ]
        } as unknown as generatorsYml.GeneratorGroup;

        await expect(packLocalOutputForGroup({ group, context: createMockTaskContext() })).rejects.toThrow();
    });
});
