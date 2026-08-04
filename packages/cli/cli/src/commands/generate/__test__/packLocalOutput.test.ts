import { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { mkdir, mkdtemp, readdir, stat, writeFile } from "fs/promises";
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

describe("packLocalOutputForGroup", () => {
    let outputDir: AbsoluteFilePath;

    beforeEach(async () => {
        loggingExecaMock.mockClear();
        outputDir = AbsoluteFilePath.of(await mkdtemp(path.join(tmpdir(), "fern-pack-test-")));
    });

    it("skips generators without local-file-system output", async () => {
        const group = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [
                createGenerator({ name: "fernapi/fern-python-sdk", language: "python", outputPath: undefined })
            ]
        } as unknown as generatorsYml.GeneratorGroup;

        await packLocalOutputForGroup({ group, context: createMockTaskContext() });
        expect(loggingExecaMock).not.toHaveBeenCalled();
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
