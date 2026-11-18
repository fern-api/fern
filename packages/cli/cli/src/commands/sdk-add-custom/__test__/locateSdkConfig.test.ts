import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join as pathJoin } from "node:path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { afterEach, describe, expect, it } from "vitest";
import { locateSdkConfig } from "../addMcpCustomCode.js";

describe("locateSdkConfig", () => {
    const made: string[] = [];
    afterEach(() => {
        made.length = 0;
    });

    async function fernDir(): Promise<AbsoluteFilePath> {
        const dir = await mkdtemp(pathJoin(tmpdir(), "mcp-locate-"));
        made.push(dir);
        return AbsoluteFilePath.of(dir);
    }
    async function write(dir: AbsoluteFilePath, relativePath: string): Promise<void> {
        const full = pathJoin(dir, relativePath);
        await mkdir(pathJoin(full, ".."), { recursive: true });
        await writeFile(full, "schemaVersion: sdk-config/v1\n");
    }

    it("finds the root sdk-config.yml and uses the fern dir as the base", async () => {
        const dir = await fernDir();
        await write(dir, "sdk-config.yml");
        const result = await locateSdkConfig(dir, undefined);
        expect("error" in result).toBe(false);
        if (!("error" in result)) {
            expect(result.sdkConfigPath).toBe(pathJoin(dir, "sdk-config.yml"));
            expect(result.baseDir).toBe(dir);
        }
    });

    it("finds a per-API sdk-config.yml when there is no root one", async () => {
        const dir = await fernDir();
        await write(dir, "apis/payments/sdk-config.yml");
        const result = await locateSdkConfig(dir, undefined);
        expect("error" in result).toBe(false);
        if (!("error" in result)) {
            expect(result.sdkConfigPath).toBe(pathJoin(dir, "apis/payments/sdk-config.yml"));
            expect(result.baseDir).toBe(pathJoin(dir, "apis/payments"));
        }
    });

    it("errors and asks for --api when root and per-API configs both exist", async () => {
        const dir = await fernDir();
        await write(dir, "sdk-config.yml");
        await write(dir, "apis/payments/sdk-config.yml");
        const result = await locateSdkConfig(dir, undefined);
        expect("error" in result && result.error).toMatch(/--api/);
    });

    it("selects the named API when --api is given", async () => {
        const dir = await fernDir();
        await write(dir, "sdk-config.yml");
        await write(dir, "apis/payments/sdk-config.yml");
        const result = await locateSdkConfig(dir, "payments");
        expect("error" in result).toBe(false);
        if (!("error" in result)) {
            expect(result.sdkConfigPath).toBe(pathJoin(dir, "apis/payments/sdk-config.yml"));
        }
    });

    it("errors when there is no sdk-config.yml anywhere", async () => {
        const dir = await fernDir();
        const result = await locateSdkConfig(dir, undefined);
        expect("error" in result && result.error).toMatch(/No sdk-config.yml/);
    });
});
