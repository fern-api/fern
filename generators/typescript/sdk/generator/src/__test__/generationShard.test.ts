import { describe, expect, it } from "vitest";

import { shardOwnsFile, validateGenerationShard } from "../generationShard.js";

describe("shardOwnsFile", () => {
    const paths = [
        "/src/Client.ts",
        "/src/api/types/Widget.ts",
        "/src/api/resources/users/types/User.ts",
        "/src/api/resources/users/client/UsersClient.ts",
        "/src/api/resources/users/client/requests/GetUserRequest.ts",
        "/src/serialization/resources/users/types/User.ts"
    ];

    it("assigns every file to exactly one shard", () => {
        for (const path of paths) {
            expect([0, 1, 2].filter((index) => shardOwnsFile(path, 3, index))).toHaveLength(1);
        }
    });

    it("keeps resource clients and requests together", () => {
        const client = "/src/api/resources/users/client/UsersClient.ts";
        const request = "/src/api/resources/users/client/requests/GetUserRequest.ts";
        for (let index = 0; index < 3; index++) {
            expect(shardOwnsFile(client, 3, index)).toBe(shardOwnsFile(request, 3, index));
        }
    });

    it("supports custom source directory names", () => {
        const path = "/generated/api/resources/users/types/User.ts";
        expect([0, 1, 2].filter((index) => shardOwnsFile(path, 3, index))).toHaveLength(1);
    });

    it("assigns shared files to shard zero", () => {
        expect(shardOwnsFile("/src/Client.ts", 3, 0)).toBe(true);
        expect(shardOwnsFile("/src/Client.ts", 3, 1)).toBe(false);
    });

    it("does not shard when count is one", () => {
        expect(shardOwnsFile("/src/Client.ts", 1, 0)).toBe(true);
    });

    it("validates shard values", () => {
        expect(validateGenerationShard({ count: 3, index: 1 })).toEqual({ count: 3, index: 1 });
        expect(() => validateGenerationShard({ count: 0, index: 0 })).toThrow(
            "Shard count must be a positive integer."
        );
        expect(() => validateGenerationShard({ count: 2, index: 2 })).toThrow("Shard index must be in [0, count).");
        expect(() => validateGenerationShard({ count: 1.5, index: 0 })).toThrow(
            "Shard count must be a positive integer."
        );
        expect(() => validateGenerationShard({ count: 2, index: 1.5 })).toThrow("Shard index must be in [0, count).");
    });
});
