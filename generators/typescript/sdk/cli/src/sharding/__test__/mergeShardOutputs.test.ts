import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { mergeShardOutputs } from "../mergeShardOutputs.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
    await Promise.all(
        temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
    );
});

describe("mergeShardOutputs", () => {
    it("merges distributed aggregate barrels and fixes ESM imports", async () => {
        const { output, shards, write } = await createFixture();
        for (const shard of shards) {
            await write(shard, "api/resources/index.ts", "");
        }
        await write(shards[0], "api/index.ts", 'export * from "./errors/index";\n');
        await write(shards[1], "api/index.ts", 'export * from "./types/index";\n');
        await write(shards[0], "api/errors/index.ts", "");
        await write(shards[0], "api/types/index.ts", 'export * from "./Account";\n');
        await write(shards[1], "api/types/index.ts", 'export * from "./Zone";\n');
        await write(shards[0], "api/types/Account.ts", "export interface Account {}\n");
        await write(shards[1], "api/types/Zone.ts", "export interface Zone {}\n");
        await write(
            shards[0],
            "Client.ts",
            'export { Account } from "./api/types/Account";\nimport "./api/errors";\nexport const account = import("./api/types/Account.ts");\n'
        );

        const result = await mergeShardOutputs({
            outputDirectory: output,
            shardDirectories: shards
        });

        expect(result.fileCount).toBe(7);
        await expect(readFile(join(output, "api/index.ts"), "utf8")).resolves.toBe(
            'export * from "./errors/index.js";\nexport * from "./types/index.js";\n'
        );
        await expect(readFile(join(output, "api/types/index.ts"), "utf8")).resolves.toBe(
            'export * from "./Account.js";\nexport * from "./Zone.js";\n'
        );
        await expect(readFile(join(output, "Client.ts"), "utf8")).resolves.toBe(
            'export { Account } from "./api/types/Account.js";\nimport "./api/errors/index.js";\nexport const account = import("./api/types/Account.js");\n'
        );
        await expect(readFile(join(shards[0], "Client.ts"), "utf8")).resolves.toBe(
            'export { Account } from "./api/types/Account";\nimport "./api/errors";\nexport const account = import("./api/types/Account.ts");\n'
        );
    });

    it("rejects case-only path collisions", async () => {
        const { output, shards, write } = await createFixture();
        await write(shards[0], "api/resources/oAuthClients/exports.ts", "");
        await write(shards[1], "api/resources/oauthClients/exports.ts", "");

        await expect(mergeShardOutputs({ outputDirectory: output, shardDirectories: shards })).rejects.toThrow(
            "Case-only shard path collision"
        );
    });

    it("rejects conflicting non-aggregate files", async () => {
        const { output, shards, write } = await createFixture();
        await write(shards[0], "Client.ts", "export const shard = 0;\n");
        await write(shards[1], "Client.ts", "export const shard = 1;\n");

        await expect(mergeShardOutputs({ outputDirectory: output, shardDirectories: shards })).rejects.toThrow(
            "Conflicting shard file: Client.ts"
        );
    });

    it("rejects conflicting nested core implementation barrels", async () => {
        const { output, shards, write } = await createFixture();
        await write(shards[0], "core/logging/exports.ts", "export const shard = 0;\n");
        await write(shards[1], "core/logging/exports.ts", "export const shard = 1;\n");

        await expect(mergeShardOutputs({ outputDirectory: output, shardDirectories: shards })).rejects.toThrow(
            "Conflicting shard file: core/logging/exports.ts"
        );
    });

    it("merges top-level core aggregate barrels", async () => {
        const { output, shards, write } = await createFixture();
        await write(shards[0], "core/exports.ts", 'export * from "./auth/index.js";\n');
        await write(shards[1], "core/exports.ts", 'export * from "./logging/index.js";\n');
        await write(shards[0], "core/auth/index.ts", "");
        await write(shards[1], "core/logging/index.ts", "");

        await mergeShardOutputs({ outputDirectory: output, shardDirectories: shards });

        await expect(readFile(join(output, "core/exports.ts"), "utf8")).resolves.toBe(
            'export * from "./auth/index.js";\nexport * from "./logging/index.js";\n'
        );
    });

    it("accepts byte-identical shared files", async () => {
        const { output, shards, write } = await createFixture();
        await write(shards[0], "package.json", '{"name":"example"}\n');
        await write(shards[1], "package.json", '{"name":"example"}\n');

        await expect(mergeShardOutputs({ outputDirectory: output, shardDirectories: shards })).resolves.toEqual({
            fileCount: 1
        });
    });

    it("produces deterministic aggregate ordering regardless of shard order", async () => {
        const { output, shards, write } = await createFixture();
        await write(shards[0], "api/resources/index.ts", 'export * as zones from "./zones/index.js";\n');
        await write(shards[1], "api/resources/index.ts", 'export * as accounts from "./accounts/index.js";\n');
        await write(shards[0], "api/resources/zones/index.ts", "");
        await write(shards[1], "api/resources/accounts/index.ts", "");

        await mergeShardOutputs({
            outputDirectory: output,
            shardDirectories: [...shards].reverse()
        });

        await expect(readFile(join(output, "api/resources/index.ts"), "utf8")).resolves.toBe(
            'export * as accounts from "./accounts/index.js";\nexport * as zones from "./zones/index.js";\n'
        );
    });

    it("does not rewrite import-like text in strings or comments", async () => {
        const { output, shards, write } = await createFixture();
        const source = 'const example = \'import "./Missing"\';\n// export * from "./Missing";\n';
        await write(shards[0], "example.ts", source);

        await mergeShardOutputs({
            outputDirectory: output,
            shardDirectories: shards
        });

        await expect(readFile(join(output, "example.ts"), "utf8")).resolves.toBe(source);
    });

    it("rejects declarations in distributed barrels", async () => {
        const { output, shards, write } = await createFixture();
        await write(shards[0], "api/types/index.ts", "export const shard = 0;\n");
        await write(shards[1], "api/types/index.ts", "export const shard = 1;\n");

        await expect(mergeShardOutputs({ outputDirectory: output, shardDirectories: shards })).rejects.toThrow(
            "Non-export content in shard barrel"
        );
    });

    it("validates and normalizes a barrel from one shard", async () => {
        const { output, shards, write } = await createFixture();
        await write(shards[0], "api/types/index.ts", 'export * from "./Account";\r\n\r\n');
        await write(shards[0], "api/types/Account.ts", "export interface Account {}\n");

        await mergeShardOutputs({ outputDirectory: output, shardDirectories: shards });

        await expect(readFile(join(output, "api/types/index.ts"), "utf8")).resolves.toBe(
            'export * from "./Account.js";\n'
        );
    });

    it("rejects declarations in byte-identical barrels", async () => {
        const { output, shards, write } = await createFixture();
        for (const shard of shards) {
            await write(shard, "api/types/index.ts", "export const invalid = true;\n");
        }

        await expect(mergeShardOutputs({ outputDirectory: output, shardDirectories: shards })).rejects.toThrow(
            "Non-export content in shard barrel"
        );
    });

    it("rejects declarations in a resource barrel from one shard", async () => {
        const { output, shards, write } = await createFixture();
        await write(shards[0], "api/resources/index.ts", "export const invalid = true;\n");

        await expect(mergeShardOutputs({ outputDirectory: output, shardDirectories: shards })).rejects.toThrow(
            "Non-export content in shard barrel"
        );
    });

    it("rejects unresolved relative imports", async () => {
        const { output, shards, write } = await createFixture();
        await write(shards[0], "Client.ts", 'export { Missing } from "./Missing.js";\n');

        await expect(mergeShardOutputs({ outputDirectory: output, shardDirectories: shards })).rejects.toThrow(
            /Unresolved Fern ESM specifiers.*Client\.ts: \.\/Missing\.js/s
        );
    });

    it("preserves existing output when merge validation fails", async () => {
        const { output, shards, write } = await createFixture();
        await mkdir(output, { recursive: true });
        await writeFile(join(output, "existing.txt"), "previous output\n");
        await write(shards[0], "Client.ts", "export const shard = 0;\n");
        await write(shards[1], "Client.ts", "export const shard = 1;\n");

        await expect(mergeShardOutputs({ outputDirectory: output, shardDirectories: shards })).rejects.toThrow();
        await expect(readFile(join(output, "existing.txt"), "utf8")).resolves.toBe("previous output\n");
    });

    it("rejects overlapping output and shard paths", async () => {
        const { shards } = await createFixture();

        await expect(
            mergeShardOutputs({
                outputDirectory: join(shards[0], "output"),
                shardDirectories: shards
            })
        ).rejects.toThrow("must not overlap");
    });
});

async function createFixture(): Promise<{
    output: string;
    shards: [string, string];
    write: (shard: string, path: string, content: string) => Promise<void>;
}> {
    const root = await mkdtemp(join(tmpdir(), "fern-shards-"));
    temporaryDirectories.push(root);
    const shards: [string, string] = [join(root, "shard-0"), join(root, "shard-1")];
    await Promise.all(shards.map((shard) => mkdir(shard, { recursive: true })));
    return {
        output: join(root, "output"),
        shards,
        write: async (shard, path, content) => {
            const destination = join(shard, path);
            await mkdir(dirname(destination), { recursive: true });
            await writeFile(destination, content);
        }
    };
}
