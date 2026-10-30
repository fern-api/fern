import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { getLatestGeneratorVersion } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import type { Logger } from "@fern-api/logger";
import { createMockTaskContext, type TaskContext } from "@fern-api/task-context";
import yaml from "js-yaml";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createProtoWorkspace } from "../createProtoWorkspace.js";

vi.mock("@fern-api/configuration-loader", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/configuration-loader")>()),
    getLatestGeneratorVersion: vi.fn()
}));

const ANNOTATED_SERVICE = `syntax = "proto3";
package acme.v1;
import "google/api/annotations.proto";
service Acme {
  rpc Get(GetRequest) returns (Thing) { option (google.api.http) = { get: "/v1/things/{id}" }; }
}
message GetRequest { string id = 1; }
message Thing { string id = 1; }
`;

describe("createProtoWorkspace", () => {
    const temporaryDirectories: string[] = [];
    let warnings: string[];
    let errors: string[];
    let context: TaskContext;

    beforeEach(() => {
        vi.mocked(getLatestGeneratorVersion).mockResolvedValue("9.9.9");
        warnings = [];
        errors = [];
        const logger: Logger = {
            disable: () => undefined,
            enable: () => undefined,
            trace: () => undefined,
            debug: () => undefined,
            info: () => undefined,
            warn: (...args) => warnings.push(args.join(" ")),
            error: (...args) => errors.push(args.join(" ")),
            log: () => undefined
        };
        context = createMockTaskContext({ logger });
    });

    afterEach(async () => {
        vi.resetAllMocks();
        await Promise.all(
            temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
        );
    });

    it("copies a directory, adds missing google/api protos, and targets the one service file", async () => {
        const source = await temporaryDirectory();
        const workspace = await temporaryDirectory();
        await write(source, "acme/v1/acme.proto", ANNOTATED_SERVICE);
        await write(source, "acme/v1/types.proto", 'syntax = "proto3";\nmessage T {}\n');
        await write(source, "README.md", "not a proto");

        await run({ workspace, protoPath: source });

        expect(await exists(workspace, "proto/acme/v1/acme.proto")).toBe(true);
        expect(await exists(workspace, "proto/acme/v1/types.proto")).toBe(true);
        expect(await exists(workspace, "proto/README.md")).toBe(false);
        expect(await exists(workspace, "proto/google/api/annotations.proto")).toBe(true);
        expect(await exists(workspace, "proto/google/api/http.proto")).toBe(true);
        expect(await readProtoSpec(workspace)).toEqual({
            root: "proto",
            target: "proto/acme/v1/acme.proto",
            "from-openapi": true,
            "local-generation": true
        });
        expect(warnings).toEqual([]);
    });

    it("keeps a google/api proto the user already has and adds only the missing one", async () => {
        const source = await temporaryDirectory();
        const workspace = await temporaryDirectory();
        const customAnnotations =
            'syntax = "proto3";\npackage google.api;\nimport "google/api/http.proto";\n// custom\n';
        await write(source, "acme.proto", ANNOTATED_SERVICE);
        await write(source, "google/api/annotations.proto", customAnnotations);

        await run({ workspace, protoPath: source });

        expect(await readFile(path.join(workspace, "proto/google/api/annotations.proto"), "utf8")).toBe(
            customAnnotations
        );
        expect(await exists(workspace, "proto/google/api/http.proto")).toBe(true);
    });

    it("adds only http.proto when that is the only google/api import", async () => {
        const source = await temporaryDirectory();
        const workspace = await temporaryDirectory();
        await write(
            source,
            "acme.proto",
            ANNOTATED_SERVICE.replace("google/api/annotations.proto", "google/api/http.proto")
        );

        await run({ workspace, protoPath: source });

        expect(await exists(workspace, "proto/google/api/http.proto")).toBe(true);
        expect(await exists(workspace, "proto/google/api/annotations.proto")).toBe(false);
    });

    it("ignores a directory whose name ends in .proto but still reads the files inside it", async () => {
        const source = await temporaryDirectory();
        const workspace = await temporaryDirectory();
        await write(source, "schema.proto/acme.proto", ANNOTATED_SERVICE);

        await run({ workspace, protoPath: source });

        expect(await readProtoSpec(workspace)).toMatchObject({
            root: "proto",
            target: "proto/schema.proto/acme.proto"
        });
    });

    it("copies a single file and uses it as the target", async () => {
        const source = await temporaryDirectory();
        const workspace = await temporaryDirectory();
        await write(source, "acme.proto", ANNOTATED_SERVICE);
        await write(source, "other.proto", "message Unrelated {}");

        await run({ workspace, protoPath: path.join(source, "acme.proto") });

        expect(await exists(workspace, "proto/acme.proto")).toBe(true);
        expect(await exists(workspace, "proto/other.proto")).toBe(false);
        expect(await readProtoSpec(workspace)).toMatchObject({ root: "proto", target: "proto/acme.proto" });
    });

    it("leaves the target unset when several files define services", async () => {
        const source = await temporaryDirectory();
        const workspace = await temporaryDirectory();
        await write(source, "a.proto", ANNOTATED_SERVICE);
        await write(source, "b.proto", ANNOTATED_SERVICE.replace("service Acme", "service Beta"));

        await run({ workspace, protoPath: source });

        const spec = await readProtoSpec(workspace);
        expect(spec).toMatchObject({ root: "proto" });
        expect(spec).not.toHaveProperty("target");
    });

    it("warns about streaming, unresolved imports and a buf config, without failing", async () => {
        const source = await temporaryDirectory();
        const workspace = await temporaryDirectory();
        await write(
            source,
            "svc.proto",
            `syntax = "proto3";
import "vendor/thing.proto";
service S { rpc Watch(Req) returns (stream Res); }
message Req {}
message Res {}
`
        );
        await write(source, "buf.yaml", "version: v1\n");

        await run({ workspace, protoPath: source });

        const output = warnings.join("\n");
        expect(output).toContain("streaming");
        expect(output).toContain("vendor/thing.proto");
        expect(output).toContain("buf.yaml");
        expect(await exists(workspace, "generators.yml")).toBe(true);
        expect(await exists(workspace, "proto/buf.yaml")).toBe(false);
    });

    it("fails when there are no .proto files", async () => {
        const source = await temporaryDirectory();
        const workspace = await temporaryDirectory();
        await write(source, "notes.txt", "nothing here");

        await expect(run({ workspace, protoPath: source })).rejects.toBeDefined();
        expect(errors.join("\n")).toMatch(/No \.proto files/);
    });

    it("fails for a single file that is not a .proto", async () => {
        const source = await temporaryDirectory();
        const workspace = await temporaryDirectory();
        await write(source, "api.yml", "openapi: 3.0.0");

        await expect(run({ workspace, protoPath: path.join(source, "api.yml") })).rejects.toBeDefined();
        expect(errors.join("\n")).toMatch(/expects a \.proto/);
    });

    it("fails rather than overwrite an existing proto directory", async () => {
        const source = await temporaryDirectory();
        const workspace = await temporaryDirectory();
        await write(source, "a.proto", ANNOTATED_SERVICE);
        await write(workspace, "proto/existing.proto", "message E {}");

        await expect(run({ workspace, protoPath: source })).rejects.toBeDefined();
        expect(errors.join("\n")).toMatch(/already exists/);
    });

    it("fails when the proto is already inside the destination", async () => {
        const workspace = await temporaryDirectory();
        await write(workspace, "proto/a.proto", ANNOTATED_SERVICE);

        await expect(run({ workspace, protoPath: path.join(workspace, "proto") })).rejects.toBeDefined();
        expect(errors.join("\n")).toMatch(/already inside/);
    });

    async function run({ workspace, protoPath }: { workspace: string; protoPath: string }): Promise<void> {
        await createProtoWorkspace({
            directoryOfWorkspace: AbsoluteFilePath.of(workspace),
            protoPath: AbsoluteFilePath.of(protoPath),
            cliVersion: "0.0.0",
            context
        });
    }

    async function readProtoSpec(workspace: string): Promise<unknown> {
        const generators = yaml.load(await readFile(path.join(workspace, "generators.yml"), "utf8"));
        if (!isGeneratorsFile(generators)) {
            throw new Error("generators.yml has no api.specs");
        }
        return generators.api.specs[0]?.proto;
    }

    async function exists(directory: string, relativePath: string): Promise<boolean> {
        return await doesPathExist(AbsoluteFilePath.of(path.join(directory, relativePath)));
    }

    async function write(directory: string, relativePath: string, contents: string): Promise<void> {
        const filepath = path.join(directory, relativePath);
        await mkdir(path.dirname(filepath), { recursive: true });
        await writeFile(filepath, contents);
    }

    async function temporaryDirectory(): Promise<string> {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-init-proto-"));
        temporaryDirectories.push(directory);
        return directory;
    }
});

interface GeneratorsFile {
    api: { specs: Array<{ proto?: unknown }> };
}

function isGeneratorsFile(value: unknown): value is GeneratorsFile {
    return typeof value === "object" && value != null && "api" in value;
}
