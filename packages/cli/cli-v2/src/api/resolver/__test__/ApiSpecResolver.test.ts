import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import { Readable } from "stream";
import { describe, expect, it } from "vitest";
import { createTestContext } from "../../../__test__/utils/createTestContext.js";
import { ApiSpecResolver } from "../ApiSpecResolver.js";

function stringReadable(value: string): Readable {
    return Readable.from([Buffer.from(value, "utf-8")]);
}

describe("ApiSpecResolver", () => {
    describe('resolve("-")', () => {
        it("reads JSON OpenAPI spec from stdin and writes it to a temp .json file", async () => {
            const context = await createTestContext({ cwd: AbsoluteFilePath.of("/") });
            const resolver = new ApiSpecResolver({ context });

            const json = JSON.stringify({ openapi: "3.0.0", info: { title: "t", version: "1.0.0" }, paths: {} });
            const result = await resolver.resolve({ reference: "-", stdin: stringReadable(json) });

            expect(result.reference).toBe("stdin");
            expect(result.absoluteFilePath.endsWith("spec.json")).toBe(true);
            expect("openapi" in result.spec).toBe(true);
            const written = await readFile(result.absoluteFilePath, "utf-8");
            expect(JSON.parse(written)).toEqual(JSON.parse(json));
        });

        it("reads YAML AsyncAPI spec from stdin and writes it to a temp .yaml file", async () => {
            const context = await createTestContext({ cwd: AbsoluteFilePath.of("/") });
            const resolver = new ApiSpecResolver({ context });

            const yamlSpec = "asyncapi: 2.6.0\ninfo:\n  title: t\n  version: 1.0.0\n";
            const result = await resolver.resolve({ reference: "-", stdin: stringReadable(yamlSpec) });

            expect(result.absoluteFilePath.endsWith("spec.yaml")).toBe(true);
            expect("asyncapi" in result.spec).toBe(true);
        });

        it("throws when stdin is empty", async () => {
            const context = await createTestContext({ cwd: AbsoluteFilePath.of("/") });
            const resolver = new ApiSpecResolver({ context });

            await expect(resolver.resolve({ reference: "-", stdin: stringReadable("") })).rejects.toBeInstanceOf(
                CliError
            );
        });

        it("throws when stdin contains content with no openapi/asyncapi key", async () => {
            const context = await createTestContext({ cwd: AbsoluteFilePath.of("/") });
            const resolver = new ApiSpecResolver({ context });

            await expect(resolver.resolve({ reference: "-", stdin: stringReadable('{"foo": "bar"}') })).rejects.toThrow(
                /openapi|asyncapi/i
            );
        });
    });
});
