import { CliError } from "@fern-api/task-context";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseJsonInput, readAndParseJsonInput, readRawJsonInput } from "../resolveJsonInput.js";

describe("readRawJsonInput", () => {
    let tmp: string;

    beforeEach(async () => {
        tmp = join(tmpdir(), `fern-input-test-${randomUUID()}`);
        await mkdir(tmp, { recursive: true });
    });

    afterEach(async () => {
        await rm(tmp, { recursive: true, force: true });
    });

    it("returns inline JSON strings verbatim", async () => {
        const result = await readRawJsonInput({ value: '{"foo":"bar"}', cwd: tmp });
        expect(result).toBe('{"foo":"bar"}');
    });

    it("reads from a file when value starts with '@' (curl-style)", async () => {
        const filePath = join(tmp, "payload.json");
        await writeFile(filePath, '{"from":"file"}', "utf-8");

        const result = await readRawJsonInput({ value: "@payload.json", cwd: tmp });
        expect(result).toBe('{"from":"file"}');
    });

    it("reads from an absolute path when value starts with '@' and path is absolute", async () => {
        const filePath = join(tmp, "abs.json");
        await writeFile(filePath, '{"abs":true}', "utf-8");

        const result = await readRawJsonInput({ value: `@${filePath}`, cwd: tmp });
        expect(result).toBe('{"abs":true}');
    });

    it("throws a helpful CliError when the file does not exist", async () => {
        await expect(readRawJsonInput({ value: "@does-not-exist.json", cwd: tmp })).rejects.toMatchObject({
            message: expect.stringContaining("Failed to read --params file"),
            code: CliError.Code.ConfigError
        });
    });
});

describe("parseJsonInput", () => {
    it("parses valid JSON", () => {
        expect(parseJsonInput('{"a":1}')).toEqual({ a: 1 });
    });

    it("wraps JSON parse errors in a CliError", () => {
        expect(() => parseJsonInput("{not valid json")).toThrow();
        try {
            parseJsonInput("{not valid json");
        } catch (err) {
            expect(err).toMatchObject({
                message: expect.stringContaining("--params is not valid JSON"),
                code: CliError.Code.ConfigError
            });
        }
    });
});

describe("readAndParseJsonInput", () => {
    it("reads and parses in one call", async () => {
        const result = await readAndParseJsonInput({ value: '{"ok":true}', cwd: process.cwd() });
        expect(result).toEqual({ ok: true });
    });
});
