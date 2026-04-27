import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ApiSpecDetector } from "../api/resolver/ApiSpecDetector.js";

const MINIMAL_OPENAPI = `
openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths: {}
`;

const MINIMAL_ASYNCAPI = `
asyncapi: 2.0.0
info:
  title: Test
  version: 1.0.0
`;

const MINIMAL_GRAPHQL = `type Query { hello: String }`;

describe("ApiSpecDetector", () => {
    let testDir: AbsoluteFilePath;
    let detector: ApiSpecDetector;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(join(tmpdir(), `fern-spec-detector-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });
        detector = new ApiSpecDetector();
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    describe("GraphQL detection by file extension", () => {
        it("detects .graphql extension", async () => {
            const filePath = AbsoluteFilePath.of(join(testDir, "schema.graphql"));
            await writeFile(filePath, MINIMAL_GRAPHQL);

            const result = await detector.detect({
                absoluteFilePath: filePath,
                reference: "schema.graphql",
                content: MINIMAL_GRAPHQL
            });

            expect(result).toBe("graphql");
        });

        it("detects .graphqls extension", async () => {
            const filePath = AbsoluteFilePath.of(join(testDir, "schema.graphqls"));
            await writeFile(filePath, MINIMAL_GRAPHQL);

            const result = await detector.detect({
                absoluteFilePath: filePath,
                reference: "schema.graphqls",
                content: MINIMAL_GRAPHQL
            });

            expect(result).toBe("graphql");
        });

        it("detects .gql extension", async () => {
            const filePath = AbsoluteFilePath.of(join(testDir, "schema.gql"));
            await writeFile(filePath, MINIMAL_GRAPHQL);

            const result = await detector.detect({
                absoluteFilePath: filePath,
                reference: "schema.gql",
                content: MINIMAL_GRAPHQL
            });

            expect(result).toBe("graphql");
        });

        it("detects GraphQL extension case-insensitively (.GRAPHQL)", async () => {
            const filePath = AbsoluteFilePath.of(join(testDir, "schema.GRAPHQL"));
            await writeFile(filePath, MINIMAL_GRAPHQL);

            const result = await detector.detect({
                absoluteFilePath: filePath,
                reference: "schema.GRAPHQL",
                content: MINIMAL_GRAPHQL
            });

            expect(result).toBe("graphql");
        });

        it("detects GraphQL when the reference URL has a .graphql extension", async () => {
            // absoluteFilePath has no graphql extension, but reference (original URL) does
            const filePath = AbsoluteFilePath.of(join(testDir, "spec.yaml"));
            await writeFile(filePath, MINIMAL_GRAPHQL);

            const result = await detector.detect({
                absoluteFilePath: filePath,
                reference: "https://api.example.com/schema.graphql",
                content: MINIMAL_GRAPHQL
            });

            expect(result).toBe("graphql");
        });
    });

    describe("OpenAPI detection by content", () => {
        it("detects openapi spec from content", async () => {
            const filePath = AbsoluteFilePath.of(join(testDir, "spec.yaml"));
            await writeFile(filePath, MINIMAL_OPENAPI);

            const result = await detector.detect({
                absoluteFilePath: filePath,
                reference: "spec.yaml",
                content: MINIMAL_OPENAPI
            });

            expect(result).toBe("openapi");
        });
    });

    describe("AsyncAPI detection by content", () => {
        it("detects asyncapi spec from content", async () => {
            const filePath = AbsoluteFilePath.of(join(testDir, "spec.yaml"));
            await writeFile(filePath, MINIMAL_ASYNCAPI);

            const result = await detector.detect({
                absoluteFilePath: filePath,
                reference: "spec.yaml",
                content: MINIMAL_ASYNCAPI
            });

            expect(result).toBe("asyncapi");
        });
    });

    describe("error handling", () => {
        it("throws when content has no recognizable spec key", async () => {
            const filePath = AbsoluteFilePath.of(join(testDir, "spec.yaml"));
            const unknownContent = "foo: bar\nbaz: qux\n";
            await writeFile(filePath, unknownContent);

            await expect(
                detector.detect({
                    absoluteFilePath: filePath,
                    reference: "spec.yaml",
                    content: unknownContent
                })
            ).rejects.toThrow();
        });
    });
});
