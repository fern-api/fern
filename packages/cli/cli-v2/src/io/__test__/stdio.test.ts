import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";

import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { Readable, Writable } from "stream";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
    isStdioMarker,
    readInput,
    readJsonOrPath,
    StdioMarkerGuard,
    writeOutputJson,
    writeOutputString
} from "../stdio.js";

function stringReadable(value: string): Readable {
    return Readable.from([Buffer.from(value, "utf-8")]);
}

function capturingWritable(): { stream: Writable; getOutput: () => string } {
    const chunks: Buffer[] = [];
    const stream = new Writable({
        write(chunk, _encoding, callback) {
            chunks.push(Buffer.from(chunk));
            callback();
        }
    });
    return {
        stream,
        getOutput: () => Buffer.concat(chunks).toString("utf-8")
    };
}

describe("isStdioMarker", () => {
    it("returns true for `-`", () => {
        expect(isStdioMarker("-")).toBe(true);
    });

    it("returns false for other values", () => {
        expect(isStdioMarker("foo")).toBe(false);
        expect(isStdioMarker("")).toBe(false);
        expect(isStdioMarker(undefined)).toBe(false);
        expect(isStdioMarker(null)).toBe(false);
        expect(isStdioMarker("--")).toBe(false);
    });
});

describe("readInput", () => {
    let tmpDir: string;
    let filePath: string;

    beforeAll(async () => {
        tmpDir = await mkdtemp(join(tmpdir(), "stdio-readInput-"));
        filePath = join(tmpDir, "input.txt");
        await writeFile(filePath, "hello from file");
    });

    afterAll(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("reads from stdin when value is `-`", async () => {
        const stdin = stringReadable("hello from stdin");
        const result = await readInput("-", { stdin });
        expect(result).toBe("hello from stdin");
    });

    it("reads from a file path otherwise", async () => {
        const result = await readInput(filePath);
        expect(result).toBe("hello from file");
    });

    it("throws when the file does not exist", async () => {
        const badPath = join(tmpDir, "does-not-exist.txt");
        await expect(readInput(badPath)).rejects.toThrow();
    });
});

describe("readJsonOrPath", () => {
    let tmpDir: string;
    let filePath: string;

    beforeAll(async () => {
        tmpDir = await mkdtemp(join(tmpdir(), "stdio-readJsonOrPath-"));
        filePath = join(tmpDir, "input.json");
        await writeFile(filePath, JSON.stringify({ fromFile: true }));
    });

    afterAll(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("parses inline JSON objects", async () => {
        const result = await readJsonOrPath('{"hello": "world"}');
        expect(result).toEqual({ hello: "world" });
    });

    it("parses inline JSON arrays", async () => {
        const result = await readJsonOrPath("[1, 2, 3]");
        expect(result).toEqual([1, 2, 3]);
    });

    it("reads a file path when the value is not obviously JSON", async () => {
        const result = await readJsonOrPath(filePath);
        expect(result).toEqual({ fromFile: true });
    });

    it("reads JSON from stdin when value is `-`", async () => {
        const stdin = stringReadable('{"fromStdin": true}');
        const result = await readJsonOrPath("-", { stdin });
        expect(result).toEqual({ fromStdin: true });
    });

    it("throws a ConfigError when the value is neither valid JSON nor a readable file", async () => {
        const badPath = join(tmpDir, "does-not-exist.json");
        await expect(readJsonOrPath(badPath, { flagName: "config" })).rejects.toThrowError(CliError);
    });

    it("throws a ParseError when stdin contains invalid JSON", async () => {
        const stdin = stringReadable("not json");
        await expect(readJsonOrPath("-", { stdin, flagName: "config" })).rejects.toThrowError(/invalid JSON/);
    });
});

describe("writeOutputJson", () => {
    let tmpDir: string;

    beforeAll(async () => {
        tmpDir = await mkdtemp(join(tmpdir(), "stdio-writeOutputJson-"));
    });

    afterAll(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("streams JSON to stdout when path is `-`", async () => {
        const { stream, getOutput } = capturingWritable();
        await writeOutputJson("-", { hello: "world" }, { stdout: stream, pretty: false });
        expect(JSON.parse(getOutput())).toEqual({ hello: "world" });
    });

    it("pretty-prints by default", async () => {
        const { stream, getOutput } = capturingWritable();
        await writeOutputJson("-", { a: 1 }, { stdout: stream });
        expect(getOutput()).toContain("\n");
    });

    it("writes to a file when path is an absolute path", async () => {
        const filePath = AbsoluteFilePath.of(join(tmpDir, "output.json"));
        await writeOutputJson(filePath, { hello: "file" }, { pretty: false });
        const content = await readFile(filePath, "utf-8");
        expect(JSON.parse(content)).toEqual({ hello: "file" });
    });
});

describe("writeOutputString", () => {
    let tmpDir: string;

    beforeAll(async () => {
        tmpDir = await mkdtemp(join(tmpdir(), "stdio-writeOutputString-"));
    });

    afterAll(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("writes a string to stdout when path is `-`", async () => {
        const { stream, getOutput } = capturingWritable();
        await writeOutputString("-", "hello stdout", { stdout: stream });
        expect(getOutput()).toBe("hello stdout");
    });

    it("writes to a file when path is a real path", async () => {
        const filePath = AbsoluteFilePath.of(join(tmpDir, "out.txt"));
        await writeOutputString(filePath, "hello file");
        expect(await readFile(filePath, "utf-8")).toBe("hello file");
    });
});

describe("StdioMarkerGuard", () => {
    it("allows one stdin and one stdout claim", () => {
        const guard = new StdioMarkerGuard();
        expect(() => guard.claimStdin("api")).not.toThrow();
        expect(() => guard.claimStdout("output")).not.toThrow();
    });

    it("throws when stdin is claimed twice", () => {
        const guard = new StdioMarkerGuard();
        guard.claimStdin("api");
        expect(() => guard.claimStdin("overlay")).toThrowError(/stdin once per command/);
    });

    it("throws when stdout is claimed twice", () => {
        const guard = new StdioMarkerGuard();
        guard.claimStdout("output");
        expect(() => guard.claimStdout("report")).toThrowError(/stdout once per command/);
    });
});
