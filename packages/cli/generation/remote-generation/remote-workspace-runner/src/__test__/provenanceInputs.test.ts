import type { OpenAPISpec, ProtobufSpec } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { createHash } from "crypto";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { digestFile, getSpecFilePaths } from "../provenanceInputs.js";

describe("getSpecFilePaths", () => {
    it("includes spec, overrides, and overlays for OpenAPI specs", () => {
        const spec: OpenAPISpec = {
            type: "openapi",
            absoluteFilepath: AbsoluteFilePath.of("/repo/fern/openapi.yml"),
            absoluteFilepathToOverrides: [
                AbsoluteFilePath.of("/repo/fern/overrides-a.yml"),
                AbsoluteFilePath.of("/repo/fern/overrides-b.yml")
            ],
            absoluteFilepathToOverlays: AbsoluteFilePath.of("/repo/fern/overlay.yml"),
            source: { type: "openapi", file: AbsoluteFilePath.of("/repo/fern/openapi.yml") }
        };
        expect(getSpecFilePaths([spec])).toEqual([
            "/repo/fern/openapi.yml",
            "/repo/fern/overrides-a.yml",
            "/repo/fern/overrides-b.yml",
            "/repo/fern/overlay.yml"
        ]);
    });

    it("uses the protobuf root so imported files are covered", () => {
        const spec: ProtobufSpec = {
            type: "protobuf",
            absoluteFilepathToProtobufRoot: AbsoluteFilePath.of("/repo/proto"),
            absoluteFilepathToProtobufTarget: AbsoluteFilePath.of("/repo/proto/plant.proto"),
            absoluteFilepathToOverrides: undefined,
            relativeFilepathToProtobufRoot: RelativeFilePath.of("proto"),
            generateLocally: false,
            fromOpenAPI: false,
            dependencies: []
        };
        expect(getSpecFilePaths([spec])).toEqual(["/repo/proto"]);
    });
});

describe("digestFile", () => {
    let root: string;

    beforeEach(async () => {
        root = await mkdtemp(path.join(tmpdir(), "provenance-"));
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    it("returns a sha256 of the raw bytes and a posix path relative to the root", async () => {
        const contents = "openapi: 3.1.0\ninfo:\n  title: Plant Store\n";
        await mkdir(path.join(root, "fern"), { recursive: true });
        const file = path.join(root, "fern", "openapi.yml");
        await writeFile(file, contents);

        expect(await digestFile(file, root)).toEqual({
            path: "fern/openapi.yml",
            sha256: createHash("sha256").update(contents).digest("hex")
        });
    });

    it("keeps the absolute path for files outside the root", async () => {
        const file = path.join(root, "openapi.yml");
        await writeFile(file, "{}");
        const otherRoot = path.join(root, "nested");
        await mkdir(otherRoot);

        expect((await digestFile(file, otherRoot)).path).toBe(file.split(path.sep).join("/"));
    });
});
