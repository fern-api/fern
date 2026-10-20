import { describe, expect, it } from "vitest";

import { selectApiFolders } from "../select-api-folders.js";

describe("selectApiFolders", () => {
    it.each([
        {
            name: "no --api and one folder",
            input: { available: ["a"], requested: undefined, defaultToAll: false },
            expected: { type: "selected", names: ["a"] }
        },
        {
            name: "no --api, several folders, default to all",
            input: { available: ["a", "b"], requested: undefined, defaultToAll: true },
            expected: { type: "selected", names: ["a", "b"] }
        },
        {
            name: "no --api, several folders, no default",
            input: { available: ["a", "b"], requested: undefined, defaultToAll: false },
            expected: { type: "ambiguous", available: ["a", "b"] }
        },
        {
            name: "no --api and no folders",
            input: { available: [], requested: undefined, defaultToAll: true },
            expected: { type: "none-found" }
        },
        {
            name: "an empty --api list counts as no --api",
            input: { available: ["a", "b"], requested: [], defaultToAll: false },
            expected: { type: "ambiguous", available: ["a", "b"] }
        },
        {
            name: "--api names a folder",
            input: { available: ["a", "b"], requested: "b", defaultToAll: false },
            expected: { type: "selected", names: ["b"] }
        },
        {
            name: "--api names both folders, in the other order (folder order wins)",
            input: { available: ["a", "b"], requested: ["b", "a"], defaultToAll: false },
            expected: { type: "selected", names: ["a", "b"] }
        },
        {
            name: "--api repeats a name",
            input: { available: ["a", "b"], requested: ["a", "a"], defaultToAll: false },
            expected: { type: "selected", names: ["a"] }
        },
        {
            name: "--api names a missing folder",
            input: { available: ["a"], requested: "x", defaultToAll: false },
            expected: { type: "unknown", names: ["x"] }
        },
        {
            name: "--api names several missing folders (all of them are reported)",
            input: { available: ["a"], requested: ["a", "x", "y"], defaultToAll: false },
            expected: { type: "unknown", names: ["x", "y"] }
        },
        {
            name: "--api with no folders at all",
            input: { available: [], requested: "x", defaultToAll: false },
            expected: { type: "unknown", names: ["x"] }
        }
    ] as const)("$name", ({ input, expected }) => {
        expect(
            selectApiFolders({ ...input, requested: input.requested == null ? undefined : toMutable(input.requested) })
        ).toEqual(expected);
    });
});

function toMutable(requested: string | readonly string[]): string | string[] {
    return typeof requested === "string" ? requested : [...requested];
}
