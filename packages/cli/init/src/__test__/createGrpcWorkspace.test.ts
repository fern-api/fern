import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { getLatestGeneratorVersion } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import yaml from "js-yaml";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createGrpcWorkspace } from "../createWorkspace.js";

vi.mock("@fern-api/configuration-loader", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/configuration-loader")>()),
    getLatestGeneratorVersion: vi.fn()
}));

describe("createGrpcWorkspace", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        vi.resetAllMocks();
        await Promise.all(
            temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
        );
    });

    it("writes the sample proto and the files it imports under the proto root", async () => {
        const directory = await temporaryDirectory();

        await createGrpcWorkspace({
            directoryOfWorkspace: AbsoluteFilePath.of(directory),
            cliVersion: "0.0.0",
            context: createMockTaskContext()
        });

        for (const file of [
            "proto/userservice/v1/user_service.proto",
            "proto/google/api/annotations.proto",
            "proto/google/api/http.proto"
        ]) {
            expect(await doesPathExist(AbsoluteFilePath.of(path.join(directory, file)))).toBe(true);
        }
        const proto = await readFile(path.join(directory, "proto/userservice/v1/user_service.proto"), "utf8");
        expect(proto).toContain("service UserDirectory");
        expect(proto).toContain("option (google.api.http)");
        // The C# generator cannot build streaming RPCs, so the sample must not contain any.
        expect(proto).not.toMatch(/returns\s*\(\s*stream\b|rpc\s+\w+\s*\(\s*stream\b/);
    });

    it("configures a locally compiled proto spec and a C# SDK that is generated into the project", async () => {
        const directory = await temporaryDirectory();
        vi.mocked(getLatestGeneratorVersion).mockResolvedValue("9.9.9");

        await createGrpcWorkspace({
            directoryOfWorkspace: AbsoluteFilePath.of(directory),
            cliVersion: "0.0.0",
            context: createMockTaskContext()
        });

        const generators = yaml.load(await readFile(path.join(directory, "generators.yml"), "utf8"));
        expect(generators).toMatchObject({
            api: {
                specs: [
                    {
                        proto: {
                            root: "proto",
                            target: "proto/userservice/v1/user_service.proto",
                            "from-openapi": true,
                            // Remote Protobuf compilation is unimplemented, so this must stay true.
                            "local-generation": true
                        }
                    }
                ]
            }
        });
    });

    it("uses the latest compatible C# generator version, falling back to the preset", async () => {
        const withLatest = await temporaryDirectory();
        vi.mocked(getLatestGeneratorVersion).mockResolvedValue("9.9.9");
        await createGrpcWorkspace({
            directoryOfWorkspace: AbsoluteFilePath.of(withLatest),
            cliVersion: "0.0.0",
            context: createMockTaskContext()
        });
        expect(await readGenerator(withLatest)).toEqual({
            name: "fern-csharp-sdk",
            version: "9.9.9",
            output: { location: "local-file-system", path: "../sdks/csharp" }
        });

        const withFallback = await temporaryDirectory();
        vi.mocked(getLatestGeneratorVersion).mockResolvedValue(undefined);
        await createGrpcWorkspace({
            directoryOfWorkspace: AbsoluteFilePath.of(withFallback),
            cliVersion: "0.0.0",
            context: createMockTaskContext()
        });
        expect(await readGenerator(withFallback)).toMatchObject({ name: "fern-csharp-sdk" });
    });

    async function readGenerator(directory: string): Promise<unknown> {
        const generators = yaml.load(await readFile(path.join(directory, "generators.yml"), "utf8"));
        if (!isGeneratorsFile(generators)) {
            throw new Error("generators.yml does not contain a group with a generator");
        }
        return Object.values(generators.groups)[0]?.generators[0];
    }

    async function temporaryDirectory(): Promise<string> {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-init-grpc-"));
        temporaryDirectories.push(directory);
        return directory;
    }
});

interface GeneratorsFile {
    groups: Record<string, { generators: unknown[] }>;
}

function isGeneratorsFile(value: unknown): value is GeneratorsFile {
    return typeof value === "object" && value != null && "groups" in value;
}
